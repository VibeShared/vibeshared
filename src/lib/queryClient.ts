import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,                 // avoid retry storms
      refetchOnWindowFocus: false,  // social apps don't refetch on focus
      staleTime: 5 * 60 * 1000,     // 5 minutes
    },
    mutations: {
      retry: false,
    },
  },
});
