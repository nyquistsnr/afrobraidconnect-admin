"use client";

import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useAccessToken } from "@/lib/access-token";

/**
 * Cached admin read. Results live in the shared QueryClient (10 min fresh,
 * see lib/query-provider.tsx), so revisiting a page or filter combination is
 * served from memory instead of hitting the API again.
 */
export function useAdminQuery<T>(
  queryKey: QueryKey,
  queryFn: (accessToken: string) => Promise<T>,
  options: { enabled?: boolean } = {},
) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey,
    queryFn: () => queryFn(accessToken!),
    enabled: Boolean(accessToken) && (options.enabled ?? true),
  });
}
