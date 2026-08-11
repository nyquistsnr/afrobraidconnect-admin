// Authenticated braider-onboarding endpoints — unlike auth-client.ts these
// all require the session's accessToken, passed in explicitly by the caller
// (this module has no access to next-auth's session on its own).
import type {
  BraiderStyleCreateRequest,
  BraiderStyleResponse,
  BraiderStyleUpdateRequest,
  BusinessInfoResponse,
  BusinessInfoUpdateRequest,
  LogoConfirmRequest,
  LogoUploadUrlRequest,
  LogoUploadUrlResponse,
  OnboardingStatusResponse,
  PaginatedData,
  PhoneVerificationStatusResponse,
  SendCodeRequest,
  SendCodeResponse,
  StartVerificationResponse,
  VeriffStatusResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  PortfolioImageResponse,
  PortfolioResponse,
  PortfolioImageUploadUrlRequest,
  PortfolioImageUploadUrlResponse,
  PortfolioImageConfirmRequest,
  PortfolioImageUpdateRequest,
  ServiceLocationUpdateRequest,
  ServiceLocationResponse,
  AvailabilitySettingsResponse,
  AvailabilitySettingsUpdateRequest,
  WeeklyWindowResponse,
  WeeklyWindowCreateRequest,
  WeeklyWindowUpdateRequest,
  AvailabilityExceptionResponse,
  AvailabilityExceptionCreateRequest,
  AccountLinkResponse,
  DashboardLinkResponse,
  PaymentSetupStatusResponse,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { apiFetch, ApiError } from "@/lib/api/http";

const ONBOARDING_PATH = "/braiders/onboarding";

interface RequestOptions {
  method?: "GET" | "PUT" | "POST" | "DELETE" | "PATCH";
  body?: unknown;
  accessToken: string;
  lang: Locale;
}

function request<TRes>(
  path: string,
  { method, body, accessToken, lang }: RequestOptions
): Promise<TRes> {
  return apiFetch<TRes>(`${ONBOARDING_PATH}${path}`, {
    method,
    body,
    accessToken,
    lang,
  });
}

export const onboardingApi = {
  getBusinessInfo: (accessToken: string, lang: Locale) =>
    request<BusinessInfoResponse>("/business-info", { accessToken, lang }),

  updateBusinessInfo: (
    accessToken: string,
    body: BusinessInfoUpdateRequest,
    lang: Locale
  ) =>
    request<BusinessInfoResponse>("/business-info", {
      method: "PUT",
      body,
      accessToken,
      lang,
    }),

  getLogoUploadUrl: (
    accessToken: string,
    body: LogoUploadUrlRequest,
    lang: Locale
  ) =>
    request<LogoUploadUrlResponse>("/business-info/logo/upload-url", {
      method: "POST",
      body,
      accessToken,
      lang,
    }),

  confirmLogo: (accessToken: string, body: LogoConfirmRequest, lang: Locale) =>
    request<BusinessInfoResponse>("/business-info/logo/confirm", {
      method: "POST",
      body,
      accessToken,
      lang,
    }),

  // Raw presigned-URL PUT — S3, not our API, so no envelope, no auth header,
  // and no Accept-Language (there's no localized content in an S3 PUT).
  uploadLogoFile: async (uploadUrl: string, file: File) => {
    let res: Response;
    try {
      res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
    } catch {
      throw new ApiError("NETWORK_ERROR", "Could not reach the server.", 0);
    }

    if (!res.ok) {
      throw new ApiError(
        "LOGO_UPLOAD_FAILED",
        "Could not upload the image.",
        res.status
      );
    }
  },

  sendPhoneCode: (accessToken: string, body: SendCodeRequest, lang: Locale) =>
    request<SendCodeResponse>("/phone-verification/send-code", {
      method: "POST",
      body,
      accessToken,
      lang,
    }),

  verifyPhoneCode: (accessToken: string, body: VerifyCodeRequest, lang: Locale) =>
    request<VerifyCodeResponse>("/phone-verification/verify-code", {
      method: "POST",
      body,
      accessToken,
      lang,
    }),

  getPhoneVerificationStatus: (accessToken: string, lang: Locale) =>
    request<PhoneVerificationStatusResponse>("/phone-verification/status", {
      accessToken,
      lang,
    }),

  getStatus: (accessToken: string, lang: Locale) =>
    request<OnboardingStatusResponse>("/status", { accessToken, lang }),

  startVeriffSession: (accessToken: string, lang: Locale) =>
    request<StartVerificationResponse>("/veriff/session", {
      method: "POST",
      accessToken,
      lang,
    }),

  getVeriffStatus: (accessToken: string, lang: Locale) =>
    request<VeriffStatusResponse>("/veriff/status", { accessToken, lang }),

  refreshVeriffStatus: (accessToken: string, lang: Locale) =>
    request<VeriffStatusResponse>("/veriff/refresh", {
      method: "POST",
      accessToken,
      lang,
    }),

  getServices: (accessToken: string, lang: Locale, page = 1, pageSize = 20) =>
    request<PaginatedData<BraiderStyleResponse>>(
      `/services?page=${page}&page_size=${pageSize}`,
      { accessToken, lang }
    ),

  addService: (
    accessToken: string,
    body: BraiderStyleCreateRequest,
    lang: Locale
  ) =>
    request<BraiderStyleResponse>("/services", {
      method: "POST",
      body,
      accessToken,
      lang,
    }),

  updateService: (
    accessToken: string,
    braiderStyleId: string,
    body: BraiderStyleUpdateRequest,
    lang: Locale
  ) =>
    request<BraiderStyleResponse>(`/services/${braiderStyleId}`, {
      method: "PUT",
      body,
      accessToken,
      lang,
    }),

  deleteService: (accessToken: string, braiderStyleId: string, lang: Locale) =>
    request<void>(`/services/${braiderStyleId}`, {
      method: "DELETE",
      accessToken,
      lang,
    }),

  getPortfolio: (accessToken: string, lang: Locale) =>
    request<PortfolioResponse>("/portfolio", { accessToken, lang }),

  getPortfolioUploadUrl: (
    accessToken: string,
    body: PortfolioImageUploadUrlRequest,
    lang: Locale
  ) =>
    request<PortfolioImageUploadUrlResponse>("/portfolio/upload-url", {
      method: "POST",
      body,
      accessToken,
      lang,
    }),

  confirmPortfolioImage: (
    accessToken: string,
    body: PortfolioImageConfirmRequest,
    lang: Locale
  ) =>
    request<PortfolioImageResponse>("/portfolio/confirm", {
      method: "POST",
      body,
      accessToken,
      lang,
    }),

  updatePortfolioImage: (
    accessToken: string,
    imageId: string,
    body: PortfolioImageUpdateRequest,
    lang: Locale
  ) =>
    request<PortfolioImageResponse>(`/portfolio/${imageId}`, {
      method: "PUT",
      body,
      accessToken,
      lang,
    }),

  deletePortfolioImage: (accessToken: string, imageId: string, lang: Locale) =>
    request<void>(`/portfolio/${imageId}`, {
      method: "DELETE",
      accessToken,
      lang,
    }),

  // Raw presigned-URL PUT — S3, not our API; see uploadLogoFile above.
  uploadPortfolioFile: async (uploadUrl: string, file: File) => {
    let res: Response;
    try {
      res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
    } catch {
      throw new ApiError("NETWORK_ERROR", "Could not reach the server.", 0);
    }

    if (!res.ok) {
      throw new ApiError(
        "PORTFOLIO_UPLOAD_FAILED",
        "Could not upload the image.",
        res.status
      );
    }
  },

  getServiceLocation: (accessToken: string, lang: Locale) =>
    request<ServiceLocationResponse>("/service-location", {
      accessToken,
      lang,
    }),

  updateServiceLocation: (
    accessToken: string,
    body: ServiceLocationUpdateRequest,
    lang: Locale
  ) =>
    request<ServiceLocationResponse>("/service-location", {
      method: "PUT",
      body,
      accessToken,
      lang,
    }),

  // -------------------------------------------------------------------------
  // Availability
  // -------------------------------------------------------------------------

  getAvailabilitySettings: (accessToken: string, lang: Locale) =>
    request<AvailabilitySettingsResponse>("/availability/settings", {
      accessToken,
      lang,
    }),

  updateAvailabilitySettings: (
    accessToken: string,
    body: AvailabilitySettingsUpdateRequest,
    lang: Locale
  ) =>
    request<AvailabilitySettingsResponse>("/availability/settings", {
      method: "PUT",
      body,
      accessToken,
      lang,
    }),

  getWeeklyWindows: (accessToken: string, lang: Locale) =>
    request<WeeklyWindowResponse[]>("/availability/weekly-windows", {
      accessToken,
      lang,
    }),

  createWeeklyWindow: (
    accessToken: string,
    body: WeeklyWindowCreateRequest,
    lang: Locale
  ) =>
    request<WeeklyWindowResponse>("/availability/weekly-windows", {
      method: "POST",
      body,
      accessToken,
      lang,
    }),

  updateWeeklyWindow: (
    accessToken: string,
    windowId: string,
    body: WeeklyWindowUpdateRequest,
    lang: Locale
  ) =>
    request<WeeklyWindowResponse>(`/availability/weekly-windows/${windowId}`, {
      method: "PATCH", // API docs say PATCH
      body,
      accessToken,
      lang,
    }),

  deleteWeeklyWindow: (accessToken: string, windowId: string, lang: Locale) =>
    request<void>(`/availability/weekly-windows/${windowId}`, {
      method: "DELETE",
      accessToken,
      lang,
    }),

  getExceptions: (
    accessToken: string,
    lang: Locale,
    dateFrom?: string,
    dateTo?: string
  ) => {
    const query = new URLSearchParams();
    if (dateFrom) query.set("date_from", dateFrom);
    if (dateTo) query.set("date_to", dateTo);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<AvailabilityExceptionResponse[]>(
      `/availability/exceptions${qs}`,
      { accessToken, lang }
    );
  },

  createException: (
    accessToken: string,
    body: AvailabilityExceptionCreateRequest,
    lang: Locale
  ) =>
    request<AvailabilityExceptionResponse>("/availability/exceptions", {
      method: "POST",
      body,
      accessToken,
      lang,
    }),

  deleteException: (accessToken: string, exceptionId: string, lang: Locale) =>
    request<void>(`/availability/exceptions/${exceptionId}`, {
      method: "DELETE",
      accessToken,
      lang,
    }),

  // -------------------------------------------------------------------------
  // Payment Setup
  // -------------------------------------------------------------------------

  getPaymentSetupStatus: (accessToken: string, lang: Locale) =>
    request<PaymentSetupStatusResponse>("/payment-setup/status", {
      accessToken,
      lang,
    }),

  createAccountLink: (accessToken: string, lang: Locale) =>
    request<AccountLinkResponse>("/payment-setup/account-link", {
      method: "POST",
      accessToken,
      lang,
    }),

  createDashboardLink: (accessToken: string, lang: Locale) =>
    request<DashboardLinkResponse>("/payment-setup/dashboard-link", {
      method: "POST",
      accessToken,
      lang,
    }),

  refreshPaymentSetupStatus: (accessToken: string, lang: Locale) =>
    request<PaymentSetupStatusResponse>("/payment-setup/refresh", {
      method: "POST",
      accessToken,
      lang,
    }),
};
