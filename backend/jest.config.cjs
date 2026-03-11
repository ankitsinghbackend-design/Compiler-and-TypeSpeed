// For projects using ESM (type: module in package.json), Jest config needs to be in CommonJS format
module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'node',
  
  // Transform ES modules using babel-jest
  transform: {
    "^.+\\.js$": ["babel-jest", { "rootMode": "upward" }]
  },
  
  // Indicates whether the coverage information should be collected
  collectCoverage: true,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // An array of regexp pattern strings that are matched against all file paths before executing the test
  testPathIgnorePatterns: ['/node_modules/'],

  // Increase timeout for async operations
  testTimeout: 15000,
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    "node_modules/(?!(module-that-needs-transform)/)"
  ],
  
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },

  // Configure test matching pattern
  testMatch: [
    "**/__tests__/**/*.js",
    "**/?(*.)+(spec|test).js"
  ],

  // Clear mocks between tests
  clearMocks: true,

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['text', 'lcov', 'clover']
};
