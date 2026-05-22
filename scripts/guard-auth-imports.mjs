#!/usr/bin/env node
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';

const RESTRICTED_MODULE_PATTERN = 'aws-amplify/(auth|utils)';
const ALLOWED_RUNTIME_IMPORT_FILE =
  'packages/ui/src/machines/authenticator/amplifyAuthAdapter.ts';

const DEFAULT_SCAN_TARGETS = [
  'packages/ui/src/machines/authenticator',
  'packages/ui/src/helpers/authenticator',
  'packages/ui/src/helpers/accountSettings',
  'packages/react-core/src/AuthService',
  'packages/react-core/src/Authenticator',
  'packages/react/src/components/Authenticator',
  'packages/react/src/components/AccountSettings',
  'packages/react/src/hooks/useAuth.ts',
];

const IGNORED_DIRECTORY_NAMES = new Set([
  '__mocks__',
  '__tests__',
  'coverage',
  'dist',
  'node_modules',
]);

const SOURCE_EXTENSIONS = new Set([
  '.cjs',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
]);

const STATIC_FROM_IMPORT_RE = new RegExp(
  String.raw`\bimport\s+(type\s+)?[^;]*?\s+from\s*['"](${RESTRICTED_MODULE_PATTERN})['"]`,
  'g'
);
const SIDE_EFFECT_IMPORT_RE = new RegExp(
  String.raw`\bimport\s*['"](${RESTRICTED_MODULE_PATTERN})['"]`,
  'g'
);
const DYNAMIC_IMPORT_RE = new RegExp(
  String.raw`\bimport\s*\(\s*['"](${RESTRICTED_MODULE_PATTERN})['"]\s*\)`,
  'g'
);
const REQUIRE_RE = new RegExp(
  String.raw`\brequire\s*\(\s*['"](${RESTRICTED_MODULE_PATTERN})['"]\s*\)`,
  'g'
);

const rootDir = process.cwd();
const args = process.argv.slice(2);

function normalizePath(path) {
  return path.split(sep).join('/');
}

function relativePath(path, root = rootDir) {
  return normalizePath(relative(root, path));
}

function hasSourceExtension(filePath) {
  return SOURCE_EXTENSIONS.has(filePath.match(/\.[^.]+$/)?.[0]);
}

function stripComments(source) {
  let result = '';
  let index = 0;
  let inBlockComment = false;
  let inLineComment = false;

  while (index < source.length) {
    const current = source[index];
    const next = source[index + 1];

    if (inLineComment) {
      if (current === '\n') {
        inLineComment = false;
        result += current;
      } else {
        result += ' ';
      }
      index += 1;
      continue;
    }

    if (inBlockComment) {
      if (current === '*' && next === '/') {
        inBlockComment = false;
        result += '  ';
        index += 2;
      } else {
        result += current === '\n' ? '\n' : ' ';
        index += 1;
      }
      continue;
    }

    if (current === '/' && next === '/') {
      inLineComment = true;
      result += '  ';
      index += 2;
      continue;
    }

    if (current === '/' && next === '*') {
      inBlockComment = true;
      result += '  ';
      index += 2;
      continue;
    }

    result += current;
    index += 1;
  }

  return result;
}

function lineNumberForIndex(source, index) {
  return source.slice(0, index).split('\n').length;
}

function addViolationsForRegex({ filePath, regex, source, type, violations }) {
  regex.lastIndex = 0;

  for (const match of source.matchAll(regex)) {
    violations.push({
      filePath,
      line: lineNumberForIndex(source, match.index ?? 0),
      moduleName: match[1],
      type,
    });
  }
}

function findViolationsInFile(filePath, root = rootDir) {
  const relativeFilePath = relativePath(filePath, root);

  if (relativeFilePath === ALLOWED_RUNTIME_IMPORT_FILE) {
    return [];
  }

  const source = stripComments(readFileSync(filePath, 'utf8'));
  const violations = [];

  STATIC_FROM_IMPORT_RE.lastIndex = 0;
  for (const match of source.matchAll(STATIC_FROM_IMPORT_RE)) {
    const isTypeOnly = !!match[1];
    if (isTypeOnly) {
      continue;
    }

    violations.push({
      filePath,
      line: lineNumberForIndex(source, match.index ?? 0),
      moduleName: match[2],
      type: 'runtime import',
    });
  }

  addViolationsForRegex({
    filePath,
    regex: SIDE_EFFECT_IMPORT_RE,
    source,
    type: 'side-effect import',
    violations,
  });
  addViolationsForRegex({
    filePath,
    regex: DYNAMIC_IMPORT_RE,
    source,
    type: 'dynamic import',
    violations,
  });
  addViolationsForRegex({
    filePath,
    regex: REQUIRE_RE,
    source,
    type: 'require',
    violations,
  });

  return violations;
}

async function collectFiles(targetPath) {
  if (!existsSync(targetPath)) {
    return [];
  }

  const stats = statSync(targetPath);
  if (stats.isFile()) {
    return hasSourceExtension(targetPath) ? [targetPath] : [];
  }

  if (!stats.isDirectory()) {
    return [];
  }

  const entries = await readdir(targetPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && IGNORED_DIRECTORY_NAMES.has(entry.name)) {
      continue;
    }

    const entryPath = join(targetPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
    } else if (entry.isFile() && hasSourceExtension(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

async function runGuard({
  root = rootDir,
  scanTargets = DEFAULT_SCAN_TARGETS,
  quiet = false,
} = {}) {
  const files = (
    await Promise.all(
      scanTargets.map((target) => collectFiles(resolve(root, target)))
    )
  )
    .flat()
    .sort();

  const violations = files.flatMap((filePath) =>
    findViolationsInFile(filePath, root)
  );

  if (violations.length > 0) {
    if (!quiet) {
      console.error(
        [
          'Runtime imports from aws-amplify/auth and aws-amplify/utils must stay behind',
          `${ALLOWED_RUNTIME_IMPORT_FILE}. Use AuthServices/defaultServices or import type only.`,
        ].join(' ')
      );
      console.error('');

      for (const violation of violations) {
        console.error(
          `${relativePath(violation.filePath, root)}:${violation.line} - ${
            violation.type
          } from ${violation.moduleName}`
        );
      }
    }
    return 1;
  }

  if (!quiet) {
    console.log(
      `Auth import guard passed (${files.length} source files scanned).`
    );
  }
  return 0;
}

async function runSelfTest() {
  const tempRoot = mkdtempSync(join(tmpdir(), 'auth-import-guard-'));
  const adapterPath = join(
    tempRoot,
    'packages/ui/src/machines/authenticator/amplifyAuthAdapter.ts'
  );
  const typeOnlyPath = join(
    tempRoot,
    'packages/ui/src/machines/authenticator/actions.ts'
  );
  const badPath = join(
    tempRoot,
    'packages/react/src/components/Authenticator/Bad.tsx'
  );

  for (const path of [adapterPath, typeOnlyPath, badPath]) {
    mkdirSync(path.slice(0, path.lastIndexOf(sep)), { recursive: true });
    writeFileSync(path, '', { flag: 'w' });
  }

  writeFileSync(
    adapterPath,
    "import { signIn } from 'aws-amplify/auth';\nimport { Hub } from 'aws-amplify/utils';\n"
  );
  writeFileSync(
    typeOnlyPath,
    "import type { SignInOutput } from 'aws-amplify/auth';\n"
  );
  writeFileSync(badPath, "import { signOut } from 'aws-amplify/auth';\n");

  const redResult = await runGuard({ root: tempRoot, quiet: true });

  writeFileSync(
    badPath,
    "import type { SignOutInput } from 'aws-amplify/auth';\n"
  );
  const greenResult = await runGuard({ root: tempRoot, quiet: true });

  rmSync(tempRoot, { recursive: true, force: true });

  if (redResult !== 1 || greenResult !== 0) {
    console.error('Auth import guard self-test failed.');
    return 1;
  }

  console.log('Auth import guard self-test passed.');
  return 0;
}

if (args.includes('--self-test')) {
  process.exitCode = await runSelfTest();
} else {
  const envTargets = process.env.AUTH_IMPORT_GUARD_PATHS?.split(',')
    .map((target) => target.trim())
    .filter(Boolean);
  process.exitCode = await runGuard({
    scanTargets: envTargets?.length ? envTargets : DEFAULT_SCAN_TARGETS,
  });
}
