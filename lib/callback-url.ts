// Isomorphic (no next/headers import) so both server guards and client
// components (LoginForm, GoogleSignInButton) can validate a callbackUrl
// before trusting it.

import { hasLocale, type Locale } from "@/lib/i18n";

// Only a single-leading-slash relative path is safe to bounce back to after
// login — "//evil.com" is browser shorthand for an absolute protocol-relative
// URL, and anything with "://" is already absolute, so both are rejected to
// avoid turning the login page into an open redirect.
export function sanitizeCallbackUrl(
  url: string | null | undefined,
  currentLang?: Locale
): string | null {
  if (!url) return null;
  if (!url.startsWith("/") || url.startsWith("//")) return null;
  if (url.includes("://")) return null;

  if (currentLang) {
    const segments = url.split("/");
    // segments[0] is "", segments[1] is the locale (e.g. "en")
    if (segments.length > 1 && hasLocale(segments[1])) {
      segments[1] = currentLang;
      return segments.join("/");
    }
  }

  return url;
}
