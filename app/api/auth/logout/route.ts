import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { signOut } from "@/auth";
import { authApi } from "@/lib/api/auth-client";
import { defaultLocale, hasLocale, type Locale } from "@/lib/i18n";

// A dedicated route (rather than the client-side next-auth/react signOut())
// so the refresh token — never exposed on the client session object — can
// be read server-side and revoked on the backend before the local session
// cookie is cleared.
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const langParam = req.nextUrl.searchParams.get("lang");
  const lang: Locale = hasLocale(langParam ?? "") ? (langParam as Locale) : defaultLocale;

  if (token?.refreshToken) {
    // Best-effort: the local session is torn down either way.
    await authApi.logout(token.refreshToken, lang).catch(() => {});
  }

  await signOut({ redirect: false });

  return NextResponse.json({ ok: true });
}
