// .eslintrc.cjs
module.exports = {
    root: true,
    env: { 
      browser: true, 
      es2020: true 
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react/jsx-runtime'
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parserOptions: { 
      ecmaVersion: 'latest', 
      sourceType: 'module' 
    },
    settings: { 
      react: { 
        version: 'detect' 
      } 
    },
    plugins: ['react-refresh'],
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': 'error'
    },
  }