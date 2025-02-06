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
// src/__tests__/integration/pages/feature.test.tsx

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockServer } from '@/mocks/server'
import YourPage from '@/app/[feature]/page'

describe('Feature Page Integration', () => {
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
   # Create test file in pages directory
   touch src/__tests__/integration/pages/feature.test.tsx
   ```

2. **File Naming Convention**

   - Basic Pages: `home.test.tsx`, `docs.test.tsx`
   - Feature Pages: `screenshots.test.tsx`, `admin.test.tsx`
   - Dynamic Pages: `admin-section.test.tsx`, `screenshots-module.test.tsx`

3. **Configure Test Dependencies**

   - Import required testing utilities
   - Setup MSW for API mocking
   - Configure test providers/wrappers

4. **Write Test Scenarios**

   - Main user flows
   - Error cases
   - Edge cases
   - Loading states

5. **Run and Verify**

   ```bash
   # Run specific test
   npm test -- pages/feature.test.tsx

   # Run with coverage
   npm test -- --coverage pages/feature.test.tsx
   ```

## Examples

### 1. Basic Page Test (home.test.tsx)

```typescript
// src/__tests__/integration/pages/home.test.tsx

describe('Home Page Integration', () => {
  it('completes login flow', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    // Fill form
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    // Verify success
    expect(await screen.findByText('Welcome')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/dashboard');
  });
});
```

### 2. Feature Page Test (admin.test.tsx)

```typescript
// src/__tests__/integration/pages/admin.test.tsx

describe('Admin Page Integration', () => {
  it('loads and displays sections correctly', async () => {
    render(<AdminPage />);

    // Verify loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Verify sections display
    expect(await screen.findByText('Admin Dashboard')).toBeInTheDocument();
    adminSections.forEach((section) => {
      expect(screen.getByText(section.title)).toBeInTheDocument();
    });
  });
});
```

### 3. Dynamic Page Test (admin-section.test.tsx)

```typescript
// src/__tests__/integration/pages/admin-section.test.tsx

describe('Admin Section Page Integration', () => {
  it('handles data operations', async () => {
    const user = userEvent.setup();
    render(<AdminSectionPage params={{ type: 'modules' }} />);

    // Add new item
    await user.click(screen.getByText('Add Item'));
    await user.type(screen.getByLabelText('Name'), 'New Item');
    await user.click(screen.getByText('Save'));

    // Verify item added
    expect(await screen.findByText('New Item')).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Test Organization**

   - Keep all page tests in `src/__tests__/integration/pages/`
   - Use clear, descriptive file names
   - Group related tests logically

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
