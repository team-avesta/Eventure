# Testing Strategy Documentation

> A comprehensive guide for testing Next.js applications with TypeScript

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Testing Stack](#testing-stack)
- [Setup Instructions](#setup-instructions)
- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Progress Status](#progress-status)
- [Continuous Integration and Pre-commit Hooks](#continuous-integration-and-pre-commit-hooks)

## Overview

This testing strategy covers three main types of tests:

- Unit Tests (Components, Hooks, Utils, Services) [🟡 In Progress]
- Integration Tests (API, Services, Workflows) [⚪ Not Started]
- E2E Tests (User Flows, Critical Paths) [⚪ Not Started]

## Directory Structure

```bash
src/
└── __tests__/                # Test root directory
    ├── unit/                 # Unit tests [🟡 In Progress]
    │   ├── components/       # Component tests [⚪ Not Started]
    │   │   ├── auth/        # Auth component tests
    │   │   ├── admin/       # Admin component tests
    │   │   └── screenshots/ # Screenshot component tests
    │   ├── hooks/           # Custom hooks tests [✅ Completed]
    │   │   ├── useAuth.test.ts
    │   │   ├── useAdminState.test.ts
    │   │   ├── useModules.test.ts
    │   │   └── useScreenshotUpload.test.ts
    │   ├── utils/           # Utility function tests [⚪ Not Started]
    │   └── services/        # Service layer tests [✅ Completed]
    │       ├── auth.test.ts
    │       ├── api.test.ts
    │       ├── adminS3Service.test.ts
    │       └── screenshotEvents.test.ts
    │
    ├── integration/         # Integration tests [⚪ Not Started]
    │   ├── api/            # API route tests
    │   │   ├── s3/
    │   │   │   ├── screenshots.test.ts
    │   │   │   ├── dropdowns.test.ts
    │   │   │   └── [type].test.ts
    │   ├── s3/            # S3 service integration
    │   └── workflows/     # User workflow tests
    │
    └── e2e/               # End-to-end tests [⚪ Not Started]
        ├── auth/          # Authentication flows
        ├── events/        # Event management flows
        ├── screenshots/   # Screenshot features
        └── admin/        # Admin panel flows
```

## Testing Stack [✅ Completed]

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "msw": "^2.0.11",
    "cypress": "^13.6.2",
    "ts-jest": "^29.1.1",
    "@types/jest": "^29.5.11"
  }
}
```

## Setup Instructions [✅ Completed]

1. Install Dependencies:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw cypress ts-jest @types/jest
```

2. Add Test Scripts to package.json:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress run",
    "test:e2e:dev": "cypress open"
  }
}
```

3. Configure Jest (jest.config.js):

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testPathIgnorePatterns: ['<rootDir>/cypress/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
  ],
};
```

4. Configure Cypress (cypress.config.ts):

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
  },
  video: false,
  screenshotOnRunFailure: true,
});
```

## Test Types

### 1. Unit Tests [🟡 In Progress]

#### Completed:

- ✅ Custom hooks functionality
  - Authentication hook (useAuth)
  - Admin state management (useAdminState)
  - Module management (useModules)
  - Screenshot upload (useScreenshotUpload)
- ✅ Service layer methods
  - Authentication service
  - API service
  - Admin S3 service
  - Screenshot events service

#### Pending:

- ⚪ Component tests
- ⚪ Utility function tests

Example Component Test:

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### 2. Integration Tests [⚪ Not Started]

- Test API endpoints
- Test service integrations
- Test component interactions

Example API Test:

```typescript
import { handler } from '@/app/api/endpoint';

describe('API Endpoint', () => {
  it('handles GET request', async () => {
    const req = new Request('http://localhost:3000/api/endpoint');
    const res = await handler(req);
    expect(res.status).toBe(200);
  });
});
```

### 3. E2E Tests [⚪ Not Started]

- Test complete user flows
- Test critical business paths

Example Cypress Test:

```typescript
describe('Authentication', () => {
  it('allows user to login', () => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('password');
    cy.get('[data-testid="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## Running Tests [✅ Completed]

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Open Cypress test runner
npm run test:e2e:dev
```

## Best Practices [✅ Implemented in Current Tests]

1. Component Testing:
   - ✅ Test rendering
   - ✅ Test user interactions
   - ✅ Test state changes
   - ✅ Mock external dependencies

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from '@/components/Counter';

describe('Counter', () => {
  it('increments count', () => {
    render(<Counter />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
```

2. API Testing:
   - ✅ Test success scenarios
   - ✅ Test error handling
   - ✅ Test edge cases

```typescript
import { handler } from '@/app/api/data';

describe('Data API', () => {
  it('handles missing parameters', async () => {
    const req = new Request('http://localhost:3000/api/data');
    const res = await handler(req);
    expect(res.status).toBe(400);
  });
});
```

## Progress Status

### Completed (✅):

1. Testing Stack Setup
2. Jest Configuration
3. Service Layer Tests
4. Custom Hooks Tests
5. Basic Test Infrastructure

### In Progress (🟡):

1. Unit Tests
   - Component Tests Pending
   - Utility Function Tests Pending

### Not Started (⚪):

1. Integration Tests
2. E2E Tests
3. Component Tests
4. Utility Function Tests

## Next Steps

1. Implement component tests
2. Add utility function tests
3. Set up integration tests
4. Configure and implement E2E tests with Cypress

## Common Patterns

1. Test Utils Setup:

```typescript
import { render } from '@testing-library/react';

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    wrapper: ({ children }) => children,
    ...options,
  });

export * from '@testing-library/react';
export { customRender as render };
```

2. Mock Data:

```typescript
export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
};

export const mockEvent = {
  id: 'evt_123',
  type: 'click',
  timestamp: new Date().toISOString(),
};
```

3. Custom Matchers:

```typescript
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () =>
        `expected ${received} to be within range ${floor} - ${ceiling}`,
    };
  },
});
```

## Coverage Goals

- Unit Tests: 80% coverage
- Integration Tests: Key workflows and API endpoints
- E2E Tests: Critical user paths

## Continuous Integration and Pre-commit Hooks [✅ Completed]

### Pre-commit Hooks

We use Husky and lint-staged to run tests before each commit. This ensures that no failing tests are committed to the repository.

Setup includes:

1. Husky for Git hooks
2. lint-staged for running commands on staged files
3. Automatic test runs on modified files

Configuration in package.json:

```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "jest --bail --findRelatedTests"]
  }
}
```

The pre-commit hook will:

1. Run ESLint on staged files and fix auto-fixable issues
2. Run Jest tests related to the changed files
3. Block the commit if any tests fail

### CI Pipeline

Add to your CI pipeline:

```yaml
test:
  script:
    - npm install
    - npm test
    - npm run test:e2e
```

For more detailed information about specific testing scenarios or patterns, refer to the individual test files in the `__tests__` directory.
