module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(d3|d3-.*|internmap|delaunator|robust-predicates)/)'
  ],
  testMatch: [
    '<rootDir>/test/spec/services/**/*.spec.js',
    '<rootDir>/test/spec/services/**/mathhelperservice.js',
    '<rootDir>/test/spec/filters/**/*.spec.js',
    '<rootDir>/test/spec/workers/Wavparserservice.spec.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    // Empty test files (no actual tests)
    'Ssffparserservice\\.spec\\.js$',
    'Soundhandlerservice\\.spec\\.js$',
    // Worker specs that test raw Worker constructors (incompatible with jsdom)
    'espsParserWorker\\.spec\\.js$',
    'textGridParserWorker\\.spec\\.js$',
    'ssffParserWorker\\.spec\\.js$',
    'spectroDrawingWorker\\.spec\\.js$'
  ],
  moduleNameMapper: {
    '\\.(scss|css)$': '<rootDir>/test/mocks/style-mock.js',
    '\\.worker\\.[jt]s$': '<rootDir>/test/mocks/worker-mock.js',
    '\\.(woff2?|ttf|eot|svg)$': '<rootDir>/test/mocks/style-mock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/test/jest-setup.js']
};
