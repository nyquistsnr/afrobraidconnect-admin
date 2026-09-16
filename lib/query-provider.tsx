"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Created once per component instance (not per render) via useState's
  // lazy initializer — keeps a fresh QueryClient per browser session
  // without recreating it on every re-render.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            // Data already fetched for a given filter/page combination is
            // considered fresh for 10 minutes, so revisiting a query (tab
            // switch, back/forward, remount) reuses the cache instead of
            // re-hitting the backend. gcTime must stay >= staleTime so an
            // unmounted query isn't evicted before it stops being fresh.
            staleTime: 10 * 60 * 1000,
            gcTime: 15 * 60 * 1000,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
