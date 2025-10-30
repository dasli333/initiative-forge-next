import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Additional ignores:
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    ".vitest/**",
  ]),
  // Global rules for all files
  {
    rules: {
      // TypeScript - STRICT: no 'any' in application code
      "@typescript-eslint/no-explicit-any": "error",
      // TypeScript - allow underscore prefix for unused variables
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // React - allow apostrophes in JSX text (common in natural language)
      "react/no-unescaped-entities": [
        "error",
        {
          forbid: [">", "}"],
        },
      ],
      // React Hooks - more lenient for complex patterns
      "react-hooks/exhaustive-deps": "warn",
      // Accessibility - allow aria-selected on buttons (common pattern with Radix UI)
      "jsx-a11y/role-supports-aria-props": "warn",
    },
  },
  // Rules specific to test files - more relaxed
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
    rules: {
      // Allow 'any' in tests for mocking and test setup
      "@typescript-eslint/no-explicit-any": "off",
      // Allow unused vars in tests (common for destructuring)
      "@typescript-eslint/no-unused-vars": "off",
      // Allow non-null assertions in tests
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  // Rules specific to e2e test files
  {
    files: ["e2e/**/*.ts", "e2e/**/*.tsx"],
    rules: {
      // E2E tests often use fixtures and helpers that don't follow React rules
      "react-hooks/rules-of-hooks": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // Rules for test setup and configuration files
  {
    files: ["**/test/setup.ts", "**/vitest.config.ts", "**/playwright.config.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
]);

export default eslintConfig;
