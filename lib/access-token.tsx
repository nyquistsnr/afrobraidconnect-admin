"use client";

import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";

const AccessTokenContext = createContext<string | undefined>(undefined);

/**
 * Seeds dashboard pages with the token the server already read, so their
 * queries can start on first render instead of waiting for the client's
 * `/api/auth/session` round-trip.
 */
export function AccessTokenProvider({
  accessToken,
  children,
}: {
  accessToken: string;
  children: React.ReactNode;
}) {
  return <AccessTokenContext.Provider value={accessToken}>{children}</AccessTokenContext.Provider>;
}

/** Prefers the client session once loaded (it picks up silent refreshes), else the server-seeded token. */
export function useAccessToken(): string | undefined {
  const seeded = useContext(AccessTokenContext);
  const { data: session } = useSession();
  return session?.accessToken ?? seeded;
}
