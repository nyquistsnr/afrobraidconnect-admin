// Isomorphic: called from both the server (NextAuth's authorize callback)
// and the client (signup/verify/forgot-password/reset-password mutations).
import type {
  AuthTokenResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  AdminInviteRequest,
  AdminInviteAcceptRequest,
  AdminInviteSocialAcceptRequest,
  ResetPasswordRequest,
  SocialLoginRequest,
  SocialProvider,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { apiFetch, ApiError } from "@/lib/api/http";

export { ApiError };

const AUTH_PATH = "/auth";
const ADMIN_AUTH_PATH = "/admin/auth";

function post<TReq, TRes>(path: string, body: TReq, lang: Locale, customPrefix?: string): Promise<TRes> {
  return apiFetch<TRes>(`${customPrefix ?? AUTH_PATH}${path}`, { method: "POST", body, lang });
}

function postAuth<TReq, TRes>(path: string, body: TReq, accessToken: string, lang: Locale): Promise<TRes> {
  return apiFetch<TRes>(`${ADMIN_AUTH_PATH}${path}`, { method: "POST", body, accessToken, lang });
}

export const authApi = {
  login: (body: LoginRequest, lang: Locale) =>
    post<LoginRequest, AuthTokenResponse>("/login", body, lang, ADMIN_AUTH_PATH),

  socialLogin: (provider: SocialProvider, body: SocialLoginRequest, lang: Locale) =>
    post<SocialLoginRequest, AuthTokenResponse>(`/social/${provider}`, body, lang, ADMIN_AUTH_PATH),

  inviteAdmin: (accessToken: string, body: AdminInviteRequest, lang: Locale) =>
    postAuth<AdminInviteRequest, { message: string; email: string }>(
      "/invites",
      body,
      accessToken,
      lang
    ),

  acceptInvite: (body: AdminInviteAcceptRequest, lang: Locale) =>
    post<AdminInviteAcceptRequest, AuthTokenResponse>(
      "/invites/accept",
      body,
      lang,
      ADMIN_AUTH_PATH
    ),

  acceptInviteSocial: (provider: SocialProvider, body: AdminInviteSocialAcceptRequest, lang: Locale) =>
    post<AdminInviteSocialAcceptRequest, AuthTokenResponse>(
      `/invites/accept/social/${provider}`,
      body,
      lang,
      ADMIN_AUTH_PATH
    ),

  refresh: (refresh_token: string, lang: Locale) =>
    post<RefreshTokenRequest, AuthTokenResponse>(
      "/refresh",
      { refresh_token },
      lang
    ),

  logout: (refresh_token: string, lang: Locale) =>
    post<LogoutRequest, { message: string }>("/logout", { refresh_token }, lang),

  forgotPassword: (body: ForgotPasswordRequest, lang: Locale) =>
    post<ForgotPasswordRequest, { message: string }>(
      "/forgot-password",
      body,
      lang
    ),

  resetPassword: (body: ResetPasswordRequest, lang: Locale) =>
    post<ResetPasswordRequest, { message: string }>("/reset-password", body, lang),
};
