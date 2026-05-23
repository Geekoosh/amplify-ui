const { defineConfig, globalIgnores } = require('eslint/config');

const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const {
  AUTH_BOUNDARY_SOURCE_FILES,
  createAuthBoundaryConfig,
} = require('@aws-amplify/eslint-config-amplify-ui/auth-boundary');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    extends: compat.extends('@aws-amplify/amplify-ui/react'),

    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },
  createAuthBoundaryConfig({
    files: [
      `src/AuthService/${AUTH_BOUNDARY_SOURCE_FILES}`,
      `src/Authenticator/${AUTH_BOUNDARY_SOURCE_FILES}`,
    ],
  }),
  globalIgnores([
    '**/eslint.config.js',
    '**/.lintstagedrc.js',
    '**/rollup.config.mjs',
    '**/coverage',
    '**/dist',
    '**/node_modules',
  ]),
  {
    extends: compat.extends('@aws-amplify/amplify-ui/jest'),
    files: ['**/__mocks__/**', '**/__tests__/**'],
  },
  {
    files: ['**/*.mjs'],
  },
]);
