import eslintPluginAstro from 'eslint-plugin-astro'
import stylistic from '@stylistic/eslint-plugin'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'

export default [
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  ...eslintPluginAstro.configs.recommended,
  stylistic.configs.customize({
    semi: false,
  }),
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ...reactPlugin.configs.flat['jsx-runtime'],
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    rules: {
      '@stylistic/function-call-spacing': 'error',
      '@stylistic/brace-style': [
        'error',
        '1tbs',
        { allowSingleLine: true },
      ],
      '@stylistic/jsx-one-expression-per-line': 'off',
      '@stylistic/object-curly-newline': [
        'error',
        {
          multiline: true,
          consistent: true,
          minProperties: 5,
        },
      ],
      '@stylistic/array-element-newline': [
        'error',
        {
          ArrayExpression: 'consistent',
          ArrayPattern: { minItems: 3 },
        },
      ],
      '@stylistic/jsx-quotes': ['error', 'prefer-single'],
      '@stylistic/space-before-function-paren': ['error', 'always'],
    },
  },
]
