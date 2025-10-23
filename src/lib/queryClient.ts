import { QueryClient } from '@tanstack/react-query';

// Browser-side singleton
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  // In SPA we're always in the browser
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 15 * 60 * 1000,    // 15 minutes
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
