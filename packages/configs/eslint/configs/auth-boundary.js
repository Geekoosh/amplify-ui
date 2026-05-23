const AUTH_BOUNDARY_SOURCE_FILES = '**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}';

const RESTRICTED_AUTH_MODULES = ['aws-amplify/auth', 'aws-amplify/utils'];

const AUTH_BOUNDARY_MESSAGE =
  'Route runtime Amplify auth access through AuthServices/defaultServices. Only the authenticator Amplify adapter may import aws-amplify/auth or aws-amplify/utils at runtime; use import type for types.';

function restrictedAuthImportEntries() {
  return RESTRICTED_AUTH_MODULES.map((name) => ({
    name,
    allowTypeImports: true,
    message: AUTH_BOUNDARY_MESSAGE,
  }));
}

function restrictedRuntimeSyntaxEntries() {
  return RESTRICTED_AUTH_MODULES.flatMap((name) => [
    {
      selector: `ImportExpression[source.value='${name}']`,
      message: AUTH_BOUNDARY_MESSAGE,
    },
    {
      selector: `CallExpression[callee.name='require'][arguments.0.value='${name}']`,
      message: AUTH_BOUNDARY_MESSAGE,
    },
  ]);
}

function createAuthBoundaryConfig({ files, ignores = [] }) {
  if (!files?.length) {
    throw new Error(
      'createAuthBoundaryConfig requires at least one file glob.'
    );
  }

  return {
    name: '@aws-amplify/amplify-ui/auth-boundary',
    files,
    ignores: ['**/__mocks__/**', '**/__tests__/**', ...ignores],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: restrictedAuthImportEntries() },
      ],
      'no-restricted-syntax': ['error', ...restrictedRuntimeSyntaxEntries()],
    },
  };
}

module.exports = {
  AUTH_BOUNDARY_SOURCE_FILES,
  createAuthBoundaryConfig,
};
