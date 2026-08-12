import { apiFetch, ApiError } from "@/lib/api/http";
import type { AdminBraiderOnboarding } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

export { ApiError };

const ADMIN_BRAIDERS_PATH = "/admin/braiders";

export const adminBraidersApi = {
  getOnboarding: (accessToken: string, lang: Locale, braiderId: string) =>
    apiFetch<AdminBraiderOnboarding>(
      `${ADMIN_BRAIDERS_PATH}/${encodeURIComponent(braiderId)}/onboarding`,
      {
        accessToken,
        lang,
      }
    ),
};
