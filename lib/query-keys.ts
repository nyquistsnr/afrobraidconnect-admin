import type { QueryClient } from "@tanstack/react-query";

/**
 * Root keys for every cached admin read. Each page's key starts with one of
 * these, so a mutation can mark a whole area stale in one call.
 */
export const adminKeys = {
  payments: ["admin-payments"],
  chatReports: ["admin-chat-reports"],
  contactSubmissions: ["admin-contact-submissions"],
  styleCatalog: ["admin-style-catalog"],
  platformSettings: ["admin-platform-settings"],
  bookings: ["admin-bookings"],
  profile: ["admin-profile"],
} as const;

/**
 * Marks cached data stale without refetching it now. The page on screen keeps
 * its local copy (which the mutation already updated); the next visit fetches
 * fresh data once instead of showing what the cache had before the change.
 */
export function markStale(queryClient: QueryClient, ...roots: (readonly unknown[])[]) {
  for (const queryKey of roots) {
    void queryClient.invalidateQueries({ queryKey, refetchType: "none" });
  }
}
