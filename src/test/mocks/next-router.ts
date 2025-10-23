import { vi } from "vitest";

/**
 * Mock Next.js router for testing
 */
export const mockPush = vi.fn();
export const mockReplace = vi.fn();
export const mockBack = vi.fn();
export const mockForward = vi.fn();
export const mockRefresh = vi.fn();
export const mockPrefetch = vi.fn();

export const createMockRouter = () => ({
  push: mockPush,
  replace: mockReplace,
  back: mockBack,
  forward: mockForward,
  refresh: mockRefresh,
  prefetch: mockPrefetch,
});

/**
 * Setup mock for next/navigation useRouter hook
 * Call this at the top of your test file after imports
 */
export const setupRouterMock = () => {
  vi.mock("next/navigation", () => ({
    useRouter: () => createMockRouter(),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
  }));
};
