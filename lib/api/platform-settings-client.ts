import { apiFetch, ApiError } from "@/lib/api/http";
import type {
  CountryVatSettings,
  CountryVatUpsertRequest,
  PlatformSettings,
  PlatformSettingsUpdateRequest,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

export { ApiError };

const PLATFORM_SETTINGS_PATH = "/admin/platform-settings";

export const platformSettingsApi = {
  get: (accessToken: string, lang: Locale) =>
    apiFetch<PlatformSettings>(PLATFORM_SETTINGS_PATH, {
      accessToken,
      lang,
    }),

  update: (
    accessToken: string,
    lang: Locale,
    body: PlatformSettingsUpdateRequest
  ) =>
    apiFetch<PlatformSettings>(PLATFORM_SETTINGS_PATH, {
      method: "PATCH",
      body,
      accessToken,
      lang,
    }),

  listCountryVat: (accessToken: string, lang: Locale) =>
    apiFetch<CountryVatSettings[]>(
      `${PLATFORM_SETTINGS_PATH}/country-vat`,
      {
        accessToken,
        lang,
      }
    ),

  upsertCountryVat: (
    accessToken: string,
    lang: Locale,
    country: string,
    body: CountryVatUpsertRequest
  ) =>
    apiFetch<CountryVatSettings>(
      `${PLATFORM_SETTINGS_PATH}/country-vat/${encodeURIComponent(country)}`,
      {
        method: "PUT",
        body,
        accessToken,
        lang,
      }
    ),

  deleteCountryVat: (accessToken: string, lang: Locale, country: string) =>
    apiFetch<void>(
      `${PLATFORM_SETTINGS_PATH}/country-vat/${encodeURIComponent(country)}`,
      {
        method: "DELETE",
        accessToken,
        lang,
      }
    ),
};
