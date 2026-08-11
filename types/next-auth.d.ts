import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import type { BraiderAuthProfile, UserType } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

declare module "next-auth" {
  interface User {
    firstName: string;
    lastName: string | null;
    phoneNumber: string | null;
    userType: UserType;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    braider: BraiderAuthProfile | null;
    // The locale active at sign-in — carried into the JWT so a later
    // silent token refresh can still send the right Accept-Language.
    lang: Locale;
  }

  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string | null;
      phoneNumber: string | null;
      userType: UserType;
    } & DefaultSession["user"];
    accessToken: string;
    braider: BraiderAuthProfile | null;
    error?: "RefreshAccessTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    firstName: string;
    lastName: string | null;
    phoneNumber: string | null;
    userType: UserType;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    braider: BraiderAuthProfile | null;
    lang: Locale;
    error?: "RefreshAccessTokenError";
  }
}
