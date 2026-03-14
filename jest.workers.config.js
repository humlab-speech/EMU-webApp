module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(d3|d3-.*|internmap|delaunator|robust-predicates)/)'
  ],
  testMatch: [
    '<rootDir>/test/spec/workers/WavRangeReqWorker.spec.js',
    '<rootDir>/test/spec/workers/HierarchyWorker.spec.js'
  ],
  moduleNameMapper: {
    '\\.(scss|css|woff2?|ttf|eot|svg)$': '<rootDir>/test/mocks/style-mock.js'
    // no worker mock — these tests import workers directly
  },
  setupFilesAfterEnv: ['<rootDir>/test/jest-setup.js']
};
