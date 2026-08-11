import NextAuth, { CredentialsSignin, type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { ApiError, authApi } from "@/lib/api/auth-client";
import type { AuthTokenResponse } from "@/lib/api/types";
import { defaultLocale, hasLocale, type Locale } from "@/lib/i18n";

function resolveLocale(value: unknown): Locale {
  return typeof value === "string" && hasLocale(value) ? value : defaultLocale;
}

class LoginError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

function toAuthUser(tokens: AuthTokenResponse, lang: Locale): User {
  return {
    id: tokens.id,
    email: tokens.email,
    name: [tokens.first_name, tokens.last_name].filter(Boolean).join(" "),
    firstName: tokens.first_name,
    lastName: tokens.last_name,
    phoneNumber: tokens.phone_number,
    userType: tokens.user_type,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    accessTokenExpires: Date.now() + tokens.expires_in * 1000,
    braider: tokens.braider,
    lang,
  };
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const refreshed = await authApi.refresh(token.refreshToken, token.lang);
    return {
      ...token,
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Credentials({
      id: "credentials",
      credentials: {
        email: {},
        password: {},
        rememberMe: {},
        lang: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        const lang = resolveLocale(credentials?.lang);

        if (typeof email !== "string" || typeof password !== "string") {
          throw new LoginError("VALIDATION_ERROR");
        }

        try {
          const tokens = await authApi.login(
            {
              email,
              password,
              remember_me: credentials?.rememberMe === "true",
            },
            lang,
          );
          return toAuthUser(tokens, lang);
        } catch (error) {
          throw new LoginError(
            error instanceof ApiError ? error.code : "UNKNOWN_ERROR",
          );
        }
      },
    }),

    Credentials({
      id: "google",
      name: "Google",
      credentials: {
        providerToken: {},
        token: {},
        lang: {},
      },
      authorize: async (credentials) => {
        const providerToken = credentials?.providerToken;
        const token = credentials?.token;
        const lang = resolveLocale(credentials?.lang);

        if (typeof providerToken !== "string") {
          throw new LoginError("VALIDATION_ERROR");
        }

        try {
          const tokens =
            typeof token === "string" && token.length > 0
              ? await authApi.acceptInviteSocial(
                  "google",
                  { token, provider_token: providerToken },
                  lang,
                )
              : await authApi.socialLogin(
                  "google",
                  { provider_token: providerToken },
                  lang,
                );
          return toAuthUser(tokens, lang);
        } catch (error) {
          throw new LoginError(
            error instanceof ApiError ? error.code : "UNKNOWN_ERROR",
          );
        }
      },
    }),
    Credentials({
      id: "accept_invite",
      name: "Accept Invite",
      credentials: {
        token: {},
        firstName: {},
        lastName: {},
        password: {},
        lang: {},
      },
      authorize: async (credentials) => {
        const token = credentials?.token;
        const firstName = credentials?.firstName;
        const lastName = credentials?.lastName;
        const password = credentials?.password;
        const lang = resolveLocale(credentials?.lang);

        if (typeof token !== "string" || typeof firstName !== "string") {
          throw new LoginError("VALIDATION_ERROR");
        }

        try {
          const tokens = await authApi.acceptInvite(
            {
              token,
              first_name: firstName,
              last_name: typeof lastName === "string" ? lastName : undefined,
              password: typeof password === "string" ? password : undefined,
            },
            lang,
          );
          return toAuthUser(tokens, lang);
        } catch (error) {
          throw new LoginError(
            error instanceof ApiError ? error.code : "UNKNOWN_ERROR",
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id as string,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          userType: user.userType,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          braider: user.braider,
          lang: user.lang,
        };
      }

      if (Date.now() < token.accessTokenExpires - 60_000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      session.user.phoneNumber = token.phoneNumber;
      session.user.userType = token.userType;
      session.accessToken = token.accessToken;
      session.braider = token.braider;
      session.error = token.error;
      return session;
    },
  },
});
