# Integration Testing Workflow

> Guide for writing and maintaining integration tests for Next.js pages and workflows

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Workflow Steps](#workflow-steps)
- [Examples](#examples)

## Overview

Integration tests focus on testing complete user flows and page behaviors rather than individual components. They verify that different parts of the application work together correctly.

## Test Structure

```typescript
// src/__tests__/integration/pages/[feature]/page.test.tsx

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockServer } from '@/mocks/server'
import YourPage from '@/app/[feature]/page'

describe('YourPage Integration', () => {
  const user = userEvent.setup()

  // Mock providers if needed
  const wrapper = ({ children }) => (
    <Providers>
      {children}
    </Providers>
  )

  beforeAll(() => mockServer.listen())
  afterEach(() => mockServer.resetHandlers())
  afterAll(() => mockServer.close())

  describe('Main User Flow', () => {
    it('completes primary user journey', async () => {
      // Arrange
      render(<YourPage />, { wrapper })

      // Act - User Journey Steps
      await user.click(...)
      await user.type(...)

      // Assert - End State
      expect(...).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles API failures gracefully', async () => {
      // Mock error response
      mockServer.use(
        rest.post('/api/endpoint', (req, res, ctx) =>
          res(ctx.status(500))
        )
      )

      // Test error flow
    })
  })
})
```

## Workflow Steps

1. **Setup Test Environment**

   ```bash
   # Create test file
   mkdir -p src/__tests__/integration/pages/[feature]
   touch src/__tests__/integration/pages/[feature]/page.test.tsx
   ```

2. **Configure Test Dependencies**

   - Import required testing utilities
   - Setup MSW for API mocking
   - Configure test providers/wrappers

3. **Write Test Scenarios**

   - Main user flows
   - Error cases
   - Edge cases
   - Loading states

4. **Run and Verify**

   ```bash
   # Run specific test
   npm test -- [feature]/page.test.tsx

   # Run with coverage
   npm test -- --coverage [feature]/page.test.tsx
   ```

## Examples

### 1. Authentication Page Test

```typescript
// src/__tests__/integration/pages/auth/page.test.tsx

describe('Auth Page Integration', () => {
  it('completes login flow', async () => {
    const user = userEvent.setup();
    render(<AuthPage />);

    // Fill form
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    // Verify success
    expect(await screen.findByText('Welcome')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/dashboard');
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();
    render(<AuthPage />);

    // Submit without data
    await user.click(screen.getByRole('button', { name: 'Login' }));

    // Verify errors
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });
});
```

### 2. Data Management Page Test

```typescript
// src/__tests__/integration/pages/admin/manage-data/page.test.tsx

describe('Data Management Page Integration', () => {
  it('loads and displays data correctly', async () => {
    // Mock API response
    mockServer.use(
      rest.get('/api/data', (req, res, ctx) =>
        res(ctx.json({ items: mockData }))
      )
    );

    render(<ManageDataPage />);

    // Verify loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Verify data display
    expect(await screen.findByText('Data Items')).toBeInTheDocument();
    mockData.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });
  });

  it('handles data operations', async () => {
    const user = userEvent.setup();
    render(<ManageDataPage />);

    // Add new item
    await user.click(screen.getByText('Add Item'));
    await user.type(screen.getByLabelText('Name'), 'New Item');
    await user.click(screen.getByText('Save'));

    // Verify item added
    expect(await screen.findByText('New Item')).toBeInTheDocument();
  });
});
```

### 3. Form Submission Test

```typescript
// src/__tests__/integration/pages/contact/page.test.tsx

describe('Contact Form Integration', () => {
  it('submits form successfully', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    // Fill form
    await user.type(screen.getByLabelText('Name'), 'John Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Message'), 'Test message');

    // Submit
    await user.click(screen.getByRole('button', { name: 'Send' }));

    // Verify success
    expect(await screen.findByText('Message sent!')).toBeInTheDocument();
  });

  it('handles server error', async () => {
    // Mock server error
    mockServer.use(
      rest.post('/api/contact', (req, res, ctx) => res(ctx.status(500)))
    );

    const user = userEvent.setup();
    render(<ContactPage />);

    // Fill and submit form
    await user.type(screen.getByLabelText('Name'), 'John Doe');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    // Verify error handling
    expect(
      await screen.findByText('Failed to send message')
    ).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Test Organization**

   - Group related tests logically
   - Use descriptive test names
   - Keep test files focused

2. **Mocking Strategy**

   - Mock external dependencies
   - Use MSW for API mocking
   - Keep mocks close to tests

3. **Assertions**

   - Test visible elements
   - Verify state changes
   - Check error states

4. **Performance**
   - Clean up after tests
   - Mock heavy operations
   - Use proper async patterns

Remember:

- Focus on user flows
- Test real interactions
- Cover error cases
- Keep tests maintainable
