import "server-only";
import { cache } from "react";
import { auth } from "@/auth";

/**
 * `auth()` deduped per request: the dashboard layout and its page both need the
 * session, and an uncached second call can repeat a backend token refresh.
 */
export const getSession = cache(() => auth());
