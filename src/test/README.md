# Testing Guide

This directory contains testing utilities, mocks, and configuration for the Initiative Forge project.

## Directory Structure

```
src/test/
├── mocks/          # Mock implementations for testing
│   └── supabase.ts # Supabase client mock
├── utils/          # Testing utilities
│   └── test-utils.tsx # Custom render function with providers
├── setup.ts        # Global test setup and configuration
└── README.md       # This file
```

## Writing Tests

### Unit Tests

Unit tests are located next to the files they test with `.test.ts` or `.test.tsx` extension.

Example:
```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { myFunction } from "./utils";

describe("myFunction", () => {
  it("should do something", () => {
    expect(myFunction()).toBe(expected);
  });
});
```

### Component Tests

Use the custom render function from `test-utils.tsx`:

```typescript
// src/components/MyComponent.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils/test-utils";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
```

### Using Mocks

Import and use mocks from the `mocks` directory:

```typescript
import { createMockSupabaseClient } from "@/test/mocks/supabase";

const mockSupabase = createMockSupabaseClient();
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Best Practices

1. **Use descriptive test names** - Test names should clearly describe what they test
2. **Follow AAA pattern** - Arrange, Act, Assert
3. **Test behavior, not implementation** - Focus on what the code does, not how
4. **Use Testing Library queries properly** - Prefer `getByRole` over `getByTestId`
5. **Mock external dependencies** - Use mocks for API calls, Supabase, etc.
6. **Keep tests isolated** - Each test should be independent
7. **Clean up after tests** - Use `afterEach` for cleanup (already configured in setup.ts)

## Coverage Goals

- Unit tests: 80% minimum coverage
- Critical paths: 100% coverage
- Edge cases: Cover error scenarios and boundary conditions
