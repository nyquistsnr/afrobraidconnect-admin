"use client";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { PlatformSettingsManager } from "@/components/dashboard/platform-settings/platform-settings-manager";
import { DashboardPageSkeleton } from "@/components/dashboard/shared/dashboard-page-skeleton";
import { platformSettingsApi } from "@/lib/api/platform-settings-client";
import type { CountryVatSettings, PlatformSettings } from "@/lib/api/types";
import { useAccessToken } from "@/lib/access-token";
import type { Locale } from "@/lib/i18n";
import { adminKeys } from "@/lib/query-keys";
import { useAdminQuery } from "@/lib/use-admin-query";

export type PlatformSettingsCache = {
  settings: PlatformSettings | null;
  countryVat: CountryVatSettings[];
  failed: boolean;
};

export const platformSettingsQueryKey = (lang: Locale) => [...adminKeys.platformSettings, lang];

export function PlatformSettingsPageClient({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["dashboard"]["platformSettings"];
}) {
  const accessToken = useAccessToken();
  const query = useAdminQuery<PlatformSettingsCache>(platformSettingsQueryKey(lang), async (token) => {
    const [settings, countryVat] = await Promise.allSettled([
      platformSettingsApi.get(token, lang),
      platformSettingsApi.listCountryVat(token, lang),
    ]);
    return {
      settings: settings.status === "fulfilled" ? settings.value : null,
      countryVat: countryVat.status === "fulfilled" ? countryVat.value : [],
      failed: settings.status === "rejected" || countryVat.status === "rejected",
    };
  });
  if (query.isPending) return <DashboardPageSkeleton />;

  return (
    <PlatformSettingsManager
      key={query.dataUpdatedAt}
      accessToken={accessToken ?? ""}
      lang={lang}
      dict={dict}
      initialSettings={query.data?.settings ?? null}
      initialCountryVat={query.data?.countryVat ?? []}
      initialLoadError={query.isError || Boolean(query.data?.failed)}
    />
  );
}
