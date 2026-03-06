# Testing Guide

This document provides comprehensive guidance on testing the AdminLTE React application.

## 📋 Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)
- [Examples](#examples)

## 🎯 Overview

We use the following testing stack:

- **Jest** - Testing framework
- **React Testing Library** - Component testing utilities
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom Jest matchers

## 🚀 Running Tests

### Watch Mode (Development)

```bash
npm test
```

Runs tests in watch mode. Tests will re-run when files change.

### Single Run (CI/CD)

```bash
npm run test:ci
```

Runs all tests once with coverage reporting. Used in CI/CD pipelines.

### Coverage Report

```bash
npm run test:coverage
```

Generates a detailed coverage report in the `coverage/` directory.

### Run Specific Test File

```bash
npm test -- usePermissions.test.ts
```

### Run Tests Matching Pattern

```bash
npm test -- --testNamePattern="should return true"
```

## ✍️ Writing Tests

### Test File Structure

Place test files next to the code they test or in a `__tests__` directory:

```
src/
├── hooks/
│   ├── usePermissions.ts
│   └── __tests__/
│       └── usePermissions.test.ts
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
```

### Basic Test Template

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

## 🧪 Test Types

### 1. Unit Tests (Hooks, Utilities)

Test individual functions and hooks in isolation.

```typescript
// src/hooks/__tests__/useDebounce.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useDebounce } from "../useDebounce";

describe("useDebounce", () => {
  it("should debounce value changes", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } },
    );

    expect(result.current).toBe("initial");

    rerender({ value: "updated", delay: 500 });
    expect(result.current).toBe("initial"); // Still old value

    await waitFor(() => expect(result.current).toBe("updated"), {
      timeout: 600,
    });
  });
});
```

### 2. Component Tests

Test React components with user interactions.

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../ui/button';

describe('Button', () => {
  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 3. Integration Tests

Test multiple components working together.

```typescript
// src/views/users/__tests__/UserList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserList from '../index';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('UserList Integration', () => {
  it('should load and display users', async () => {
    render(<UserList />, { wrapper: createWrapper() });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });
  });
});
```

## 🎭 Mocking

### Mocking API Calls

```typescript
import axios from "@app/utils/axios";

jest.mock("@app/utils/axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("API Tests", () => {
  it("should fetch users", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { data: [{ id: 1, name: "John" }] },
    });

    // Your test code
  });
});
```

### Mocking Redux Store

```typescript
import { useAppSelector } from "@app/store/store";

jest.mock("@app/store/store", () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: () => jest.fn(),
}));

const mockUseAppSelector = useAppSelector as jest.MockedFunction<
  typeof useAppSelector
>;

mockUseAppSelector.mockReturnValue({
  user: { name: "Test User" },
});
```

### Mocking React Query

```typescript
import { useQuery } from "@tanstack/react-query";

jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQuery: jest.fn(),
}));

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

mockUseQuery.mockReturnValue({
  data: mockData,
  isLoading: false,
  error: null,
} as any);
```

## 📊 Test Coverage

### Coverage Thresholds

Current thresholds (defined in `jest.config.ts`):

```typescript
coverageThresholds: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  },
}
```

### Viewing Coverage Report

After running `npm run test:coverage`, open:

```
coverage/lcov-report/index.html
```

### Coverage Goals

- **Critical paths**: 80%+ coverage
- **Business logic**: 70%+ coverage
- **UI components**: 60%+ coverage
- **Utilities**: 90%+ coverage

## ✅ Best Practices

### 1. Test Behavior, Not Implementation

❌ **Bad:**

```typescript
expect(component.state.count).toBe(5);
```

✅ **Good:**

```typescript
expect(screen.getByText("Count: 5")).toBeInTheDocument();
```

### 2. Use Accessible Queries

Prefer queries that reflect how users interact:

```typescript
// Priority order:
screen.getByRole("button", { name: /submit/i });
screen.getByLabelText(/username/i);
screen.getByPlaceholderText(/enter name/i);
screen.getByText(/welcome/i);
screen.getByTestId("custom-element"); // Last resort
```

### 3. Async Testing

Always use `waitFor` for async operations:

```typescript
await waitFor(() => {
  expect(screen.getByText("Loaded")).toBeInTheDocument();
});
```

### 4. Clean Up

Tests should be isolated and not affect each other:

```typescript
afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});
```

### 5. Descriptive Test Names

```typescript
// ❌ Bad
it("works", () => {});

// ✅ Good
it("should display error message when form validation fails", () => {});
```

### 6. Arrange-Act-Assert Pattern

```typescript
it('should increment counter when button is clicked', async () => {
  // Arrange
  const user = userEvent.setup();
  render(<Counter />);

  // Act
  await user.click(screen.getByRole('button', { name: /increment/i }));

  // Assert
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

## 🔍 Common Testing Scenarios

### Testing Forms

```typescript
it('should submit form with valid data', async () => {
  const user = userEvent.setup();
  const handleSubmit = jest.fn();

  render(<LoginForm onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /login/i }));

  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  });
});
```

### Testing Permissions

```typescript
it('should hide delete button when user lacks permission', () => {
  mockUseAppSelector.mockReturnValue({
    role: { permissions: ['view_users'] },
  });

  render(<UserList />);

  expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
});
```

### Testing Loading States

```typescript
it('should show loading spinner while fetching data', () => {
  mockUseQuery.mockReturnValue({
    data: undefined,
    isLoading: true,
  } as any);

  render(<UserList />);

  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
});
```

### Testing Error States

```typescript
it('should display error message when API call fails', async () => {
  mockedAxios.get.mockRejectedValue(new Error('Network error'));

  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText(/error loading users/i)).toBeInTheDocument();
  });
});
```

## 🐛 Debugging Tests

### View DOM Structure

```typescript
import { screen } from "@testing-library/react";

screen.debug(); // Prints entire DOM
screen.debug(screen.getByRole("button")); // Prints specific element
```

### Use logRoles

```typescript
import { logRoles } from '@testing-library/react';

const { container } = render(<MyComponent />);
logRoles(container); // Shows all available roles
```

### Increase Timeout

```typescript
await waitFor(
  () => {
    expect(screen.getByText("Loaded")).toBeInTheDocument();
  },
  { timeout: 3000 },
);
```

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### 4. End-to-End (E2E) Tests

We use **Cypress** for E2E testing to verify complete user journeys.

#### Running E2E Tests

```bash
# Open Cypress Test Runner (Interactive)
npm run cypress:open

# Run all E2E tests (Headless)
npm run cypress:run
```

#### E2E Best Practices

- Use `data-testid` for stable selectors where ARIA roles are insufficient.
- Focus on critical paths: Login, Organization Creation, Data Entry.
- Do not test implementation details; test what the user sees.

## 📊 Test Coverage

...

## 🎯 Next Steps

1. Write tests for critical user flows
2. Achieve 70% code coverage
3. Add E2E tests for all complex modules
4. Set up CI/CD to run tests automatically
5. Add visual regression testing

---

**Happy Testing! 🧪**
