# WhatsApp Business Automation Tests

This document provides instructions on how to run tests for the WhatsApp Business Automation application.

## Prerequisites

Before running tests, make sure you have:

1. Node.js (v14 or higher) installed
2. npm or yarn installed
3. All dependencies installed (`npm install`)
4. Supabase project set up with the correct schema
5. Environment variables configured

## Running Tests

### Running All Tests

To run all tests:

\`\`\`bash
npm test
\`\`\`

### Running Tests in Watch Mode

To run tests in watch mode (tests will re-run when files change):

\`\`\`bash
npm run test:watch
\`\`\`

### Running Tests with Coverage

To run tests and generate a coverage report:

\`\`\`bash
npm run test:coverage
\`\`\`

The coverage report will be generated in the `coverage` directory.

## Test Structure

The tests are organized as follows:

1. **Unit Tests**: Test individual functions and components in isolation
2. **Integration Tests**: Test interactions between components
3. **Service Tests**: Test the WhatsApp service, local LLM service, and other services

## Test Utilities

The `src/tests/test-utils.ts` file contains helper functions for testing, including:

- `clearTestData()`: Clears test data from the database
- `createTestData()`: Creates test data in the database
- `testEncryption()`: Tests encryption and decryption
- `simulateWhatsAppAuth()`: Simulates WhatsApp authentication
- `testMessageSending()`: Tests message sending

## Mocking

Some tests use mocks to avoid external dependencies:

- WhatsApp Web is mocked to avoid actual browser automation
- OpenAI API calls are mocked to avoid actual API usage
- Local LLM processing is mocked to avoid requiring a local model

## Troubleshooting

If you encounter issues running tests:

1. Make sure all environment variables are set correctly
2. Check that Supabase is accessible and the schema is correct
3. Ensure all dependencies are installed
4. Check for any network issues that might affect API calls

## Adding New Tests

When adding new features, please also add corresponding tests:

1. Unit tests for new functions and components
2. Integration tests for interactions between components
3. Update existing tests if behavior changes

## Continuous Integration

Tests are automatically run in the CI pipeline on every push to the repository.
\`\`\`

## 10. Let's create a simple test runner script

```js file="run-tests.js"
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
  }
};

// Function to run a command and return its output
function runCommand(command) {
  try {
    return execSync(command, { stdio: 'pipe' }).toString();
  } catch (error) {
    return error.stdout.toString();
  }
}

// Check if environment variables are set
function checkEnvironmentVariables() {
  console.log(`${colors.bright}${colors.fg.cyan}Checking environment variables...${colors.reset}`);
  
  const requiredVars = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log(`${colors.fg.yellow}Warning: The following environment variables are missing:${colors.reset}`);
    missingVars.forEach(varName => {
      console.log(`  - ${varName}`);
    });
    console.log(`${colors.fg.yellow}Tests may fail without these variables.${colors.reset}`);
    return false;
  } else {
    console.log(`${colors.fg.green}All required environment variables are set.${colors.reset}`);
    return true;
  }
}

// Run the tests
function runTests() {
  console.log(`${colors.bright}${colors.fg.cyan}Running tests...${colors.reset}`);
  
  const testOutput = runCommand('npm test');
  console.log(testOutput);
  
  if (testOutput.includes('FAIL')) {
    console.log(`${colors.fg.red}Some tests failed. See above for details.${colors.reset}`);
    return false;
  } else {
    console.log(`${colors.fg.green}All tests passed!${colors.reset}`);
    return true;
  }
}

// Run tests with coverage
function runTestsWithCoverage() {
  console.log(`${colors.bright}${colors.fg.cyan}Running tests with coverage...${colors.reset}`);
  
  const testOutput = runCommand('npm run test:coverage');
  console.log(testOutput);
  
  // Check if coverage directory exists
  if (fs.existsSync(path.join(__dirname, 'coverage'))) {
    console.log(`${colors.fg.green}Coverage report generated in the 'coverage' directory.${colors.reset}`);
    return true;
  } else {
    console.log(`${colors.fg.red}Failed to generate coverage report.${colors.reset}`);
    return false;
  }
}

// Main function
function main() {
  console.log(`${colors.bright}${colors.fg.magenta}WhatsApp Business Automation Test Runner${colors.reset}`);
  console.log(`${colors.dim}Running tests for the WhatsApp Business Automation application...${colors.reset}`);
  console.log();
  
  const envCheck = checkEnvironmentVariables();
  console.log();
  
  const testsPass = runTests();
  console.log();
  
  if (testsPass) {
    runTestsWithCoverage();
  }
  
  console.log();
  console.log(`${colors.bright}${colors.fg.magenta}Test Runner Complete${colors.reset}`);
}

// Run the main function
main();
