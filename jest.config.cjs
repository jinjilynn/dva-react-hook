module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.cjs'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(lodash-es|nanoid)/)'],
  testMatch: ['**/__tests__/**/*.test.js'],
};
