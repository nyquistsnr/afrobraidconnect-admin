import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { PlatformSettingsPageClient } from "@/components/dashboard/platform-settings/platform-settings-page-client";

export const metadata = { title: "Platform Settings - Admin" };

export default async function PlatformSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  // Data is loaded and cached client-side (TanStack Query), so revisits don't refetch.
  return <PlatformSettingsPageClient lang={locale} dict={dict.dashboard.platformSettings} />;
}
