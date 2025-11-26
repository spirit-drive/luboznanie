// .eslintrc.js
module.exports = {
  // Окружение (где будет выполняться код)
  env: {
    browser: true,
    es2021: true,
    node: true,
  },

  // Наборы правил
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'plugin:storybook/recommended'],

  // Парсер для TypeScript
  parser: '@typescript-eslint/parser',

  // Настройки парсера
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json', // <-- ВАЖНО: путь к вашему tsconfig.json для правил, требующих информацию о типах
  },

  // Плагины
  plugins: [
    '@typescript-eslint',
  ],

  // Ваши собственные правила (могут переопределять правила из extends)
  rules: {
    // Здесь можно добавлять или изменять правила.
    // Например, если вы не хотите требовать явного указания типа возвращаемого значения функции:
    // "@typescript-eslint/explicit-module-boundary-types": "off",
  },

  // Игнорируемые файлы и папки
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.eslintrc.js',
    '.prettierrc', // Игнорируем и файл настроек Prettier
  ],
};