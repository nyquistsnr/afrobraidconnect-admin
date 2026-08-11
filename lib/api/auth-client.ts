// Isomorphic: called from both the server (NextAuth's authorize callback)
// and the client (signup/verify/forgot-password/reset-password mutations).
import type {
  AuthTokenResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  SignupEmailRequest,
  SocialLoginRequest,
  SocialProvider,
  VerifyEmailRequest,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { apiFetch, ApiError } from "@/lib/api/http";

export { ApiError };

const AUTH_PATH = "/auth";

function post<TReq, TRes>(path: string, body: TReq, lang: Locale): Promise<TRes> {
  return apiFetch<TRes>(`${AUTH_PATH}${path}`, { method: "POST", body, lang });
}

export const authApi = {
  signup: (body: SignupEmailRequest, lang: Locale) =>
    post<SignupEmailRequest, { message: string; email: string }>(
      "/signup/email",
      body,
      lang
    ),

  verifyEmail: (body: VerifyEmailRequest, lang: Locale) =>
    post<VerifyEmailRequest, AuthTokenResponse>("/verify-email", body, lang),

  resendVerification: (body: ResendVerificationRequest, lang: Locale) =>
    post<ResendVerificationRequest, { message: string }>(
      "/resend-verification",
      body,
      lang
    ),

  login: (body: LoginRequest, lang: Locale) =>
    post<LoginRequest, AuthTokenResponse>("/login", body, lang),

  socialLogin: (provider: SocialProvider, body: SocialLoginRequest, lang: Locale) =>
    post<SocialLoginRequest, AuthTokenResponse>(`/social/${provider}`, body, lang),

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
