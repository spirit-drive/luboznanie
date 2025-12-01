/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // Определяет, в какой среде Jest должен запускать тесты.
  testEnvironment: 'jsdom',

  // Пути к файлам, которые нужно игнорировать
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],

  // Модули, которые нужно настроить перед запуском тестов
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Обработка файлов: как Jest должен их трансформировать
  transform: {
    // Использует babel-jest для транспиляции .js, .jsx
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      // Возможно, также: diagnostics: false
    }],

  },

  // Сопоставление модулей, полезно для абсолютных импортов Next.js
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',

    // Обработка статических файлов (css, изображения)
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/fileMock.js',
  },
};