/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',       // твои алиасы
    '\\.(css|scss|sass)$': 'identity-obj-proxy', // для CSS и SCSS
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // <-- подключаем polyfill
  transformIgnorePatterns: [
    "/node_modules/(?!marked|prismjs)/"
  ],
};
