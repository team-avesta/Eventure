# E2E Testing Workflow

> Guide for writing and maintaining end-to-end tests using Cypress for Next.js applications

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Test Structure](#test-structure)
- [Workflow Steps](#workflow-steps)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Overview

End-to-end tests verify the application works correctly from a user's perspective by testing complete flows in a real browser environment.

## Setup

1. **Install Dependencies**

```bash
npm install --save-dev cypress @testing-library/cypress
```

2. **Configure Cypress**

```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
  },
  retries: {
    runMode: 2,
    openMode: 0,
  },
});
```

3. **Setup Support Files**

```typescript
// cypress/support/e2e.ts
import '@testing-library/cypress/add-commands';

// Global beforeEach
beforeEach(() => {
  // Clear cookies and localStorage
  cy.clearCookies();
  cy.clearLocalStorage();
});
```

## Test Structure

```typescript
// cypress/e2e/[feature]/[scenario].cy.ts

describe('Feature: [Feature Name]', () => {
  beforeEach(() => {
    // Setup test data
    cy.task('db:seed', { users: testUsers });
    cy.intercept('GET', '/api/data', { fixture: 'data.json' });
  });

  afterEach(() => {
    // Cleanup
    cy.task('db:cleanup');
  });

  it('completes main user flow', () => {
    // Arrange
    cy.visit('/start-page');

    // Act
    cy.findByRole('button', { name: 'Start' }).click();
    cy.findByLabelText('Email').type('user@example.com');

    // Assert
    cy.url().should('include', '/success');
    cy.findByText('Welcome').should('be.visible');
  });
});
```

## Workflow Steps

1. **Create Test File**

```bash
# Create feature directory
mkdir -p cypress/e2e/[feature]

# Create test file
touch cypress/e2e/[feature]/[scenario].cy.ts
```

2. **Setup Test Data**

- Create fixtures in `cypress/fixtures/`
- Setup database seeds if needed
- Configure API interceptors

3. **Write Test Scenarios**

- Main user flows
- Edge cases
- Error scenarios
- Cross-browser testing

4. **Run Tests**

```bash
# Interactive Mode (Development)
npm run cypress:open    # Opens Cypress Test Runner UI
                       # - Visual test runner
                       # - Real-time feedback
                       # - Time-travel debugging
                       # - Live reload

# Headless Mode (CI/CD)
npm run cypress:run     # Runs tests in terminal
                       # - No UI
                       # - Faster execution
                       # - Better for CI/CD

# Legacy/Generic Command
npm run test:e2e       # Alias for cypress run
                       # - Maintained for compatibility
                       # - Same as cypress:run

# Run specific tests
npm run cypress:run -- --spec "cypress/e2e/[feature]/**/*"
```

Choose the right command based on your needs:

- Use `cypress:open` during development for better debugging
- Use `cypress:run` or `test:e2e` for CI/CD pipelines
- Use spec targeting for focused testing

## Examples

### 1. Authentication Flow

```typescript
// cypress/e2e/auth/login.cy.ts

describe('Feature: User Authentication', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login').as('loginRequest');
    cy.visit('/login');
  });

  it('successfully logs in with valid credentials', () => {
    // Fill login form
    cy.findByLabelText('Email').type('test@example.com');
    cy.findByLabelText('Password').type('password123');
    cy.findByRole('button', { name: 'Login' }).click();

    // Wait for API response
    cy.wait('@loginRequest');

    // Verify redirect and welcome message
    cy.url().should('include', '/dashboard');
    cy.findByText('Welcome back').should('be.visible');
  });

  it('shows validation errors for invalid input', () => {
    cy.findByRole('button', { name: 'Login' }).click();

    cy.findByText('Email is required').should('be.visible');
    cy.findByText('Password is required').should('be.visible');
  });

  it('handles incorrect credentials', () => {
    cy.findByLabelText('Email').type('wrong@example.com');
    cy.findByLabelText('Password').type('wrongpass');
    cy.findByRole('button', { name: 'Login' }).click();

    cy.findByText('Invalid credentials').should('be.visible');
  });
});
```

### 2. Data Management Flow

```typescript
// cypress/e2e/admin/manage-data.cy.ts

describe('Feature: Data Management', () => {
  beforeEach(() => {
    // Login as admin
    cy.loginAsAdmin();
    cy.visit('/admin/data');
  });

  it('creates and deletes data items', () => {
    // Create new item
    cy.findByRole('button', { name: 'Add New' }).click();
    cy.findByLabelText('Name').type('Test Item');
    cy.findByLabelText('Description').type('Test Description');
    cy.findByRole('button', { name: 'Save' }).click();

    // Verify item created
    cy.findByText('Test Item').should('be.visible');

    // Delete item
    cy.findByRole('button', { name: 'Delete' }).click();
    cy.findByRole('button', { name: 'Confirm' }).click();

    // Verify item deleted
    cy.findByText('Test Item').should('not.exist');
  });

  it('handles network errors gracefully', () => {
    // Mock network failure
    cy.intercept('POST', '/api/data', {
      statusCode: 500,
      body: { message: 'Server Error' },
    });

    cy.findByRole('button', { name: 'Add New' }).click();
    cy.findByLabelText('Name').type('Test Item');
    cy.findByRole('button', { name: 'Save' }).click();

    cy.findByText('Failed to save data').should('be.visible');
  });
});
```

### 3. Multi-step Form Flow

```typescript
// cypress/e2e/forms/multi-step.cy.ts

describe('Feature: Multi-step Form', () => {
  beforeEach(() => {
    cy.visit('/form');
  });

  it('completes all steps successfully', () => {
    // Step 1: Personal Info
    cy.findByLabelText('Name').type('John Doe');
    cy.findByLabelText('Email').type('john@example.com');
    cy.findByRole('button', { name: 'Next' }).click();

    // Step 2: Address
    cy.findByLabelText('Street').type('123 Main St');
    cy.findByLabelText('City').type('Test City');
    cy.findByRole('button', { name: 'Next' }).click();

    // Step 3: Review
    cy.findByText('John Doe').should('be.visible');
    cy.findByText('123 Main St').should('be.visible');
    cy.findByRole('button', { name: 'Submit' }).click();

    // Verify completion
    cy.url().should('include', '/success');
    cy.findByText('Form submitted successfully').should('be.visible');
  });

  it('allows navigation between steps', () => {
    // Fill step 1
    cy.findByLabelText('Name').type('John Doe');
    cy.findByRole('button', { name: 'Next' }).click();

    // Go back
    cy.findByRole('button', { name: 'Previous' }).click();

    // Verify data persisted
    cy.findByLabelText('Name').should('have.value', 'John Doe');
  });
});
```

## Best Practices

1. **Test Organization**

   - Group tests by feature
   - Use descriptive test names
   - Follow user flow in test steps

2. **Test Data Management**

   - Use fixtures for static data
   - Clean up test data after each test
   - Avoid dependencies between tests

3. **Network Handling**

   - Mock external API calls
   - Test loading states
   - Handle error scenarios
   - Use route aliases for waiting

4. **Selectors**

   - Use data-testid for stable selectors
   - Prefer role and label based selectors
   - Avoid brittle CSS selectors

5. **Performance**

   - Minimize full page loads
   - Share login state when possible
   - Use API calls for setup

6. **Visual Testing**

   - Take screenshots at key points
   - Test responsive layouts
   - Verify critical UI elements

7. **Cross-browser Testing**
   - Test in multiple browsers
   - Handle browser-specific issues
   - Use consistent viewport sizes

Remember:

- Test real user scenarios
- Keep tests independent
- Handle async operations properly
- Clean up test data
- Use meaningful assertions
