module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    '@typescript-eslint/recommended',
  ],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'warn',
    'no-console': 'warn',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
