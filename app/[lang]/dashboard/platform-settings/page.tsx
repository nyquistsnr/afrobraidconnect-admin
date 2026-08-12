import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import { platformSettingsApi } from "@/lib/api/platform-settings-client";
import type { CountryVatSettings, PlatformSettings } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { PlatformSettingsManager } from "@/components/dashboard/platform-settings/platform-settings-manager";

export const metadata = { title: "Platform Settings - Admin" };

export default async function PlatformSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const session = await auth();
  if (!session?.accessToken || session.user.userType !== "ADMIN") {
    redirect(`/${locale}/login`);
  }

  const dict = await getDictionary(locale);
  let settings: PlatformSettings | null = null;
  let countryVat: CountryVatSettings[] = [];
  let initialLoadError = false;

  const [settingsResult, countryVatResult] = await Promise.allSettled([
    platformSettingsApi.get(session.accessToken, locale),
    platformSettingsApi.listCountryVat(session.accessToken, locale),
  ]);

  if (settingsResult.status === "fulfilled") {
    settings = settingsResult.value;
  } else {
    initialLoadError = true;
    console.error("Failed to load platform settings:", settingsResult.reason);
  }

  if (countryVatResult.status === "fulfilled") {
    countryVat = countryVatResult.value;
  } else {
    initialLoadError = true;
    console.error("Failed to load country VAT settings:", countryVatResult.reason);
  }

  return (
    <PlatformSettingsManager
      accessToken={session.accessToken}
      lang={locale}
      dict={dict.dashboard.platformSettings}
      initialSettings={settings}
      initialCountryVat={countryVat}
      initialLoadError={initialLoadError}
    />
  );
}
