import { notFound } from "next/navigation";
import { hasLocale } from "@/app/[lang]/dictionaries";
import {
  parseAdminDashboardChartParams,
  parseAdminDashboardFilters,
} from "@/app/[lang]/dashboard/dashboard-helpers";
import {
  getAdminDashboardDict,
} from "@/components/dashboard/admin-commerce/admin-dictionaries";
import {
  AdminDashboardPage,
} from "@/components/dashboard/admin-dashboard/admin-dashboard-page";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "en";
  return { title: `${getAdminDashboardDict(locale).title} - Admin` };
}

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const resolvedSearchParams = await searchParams;
  const dict = getAdminDashboardDict(locale);
  const filters = parseAdminDashboardFilters(resolvedSearchParams);
  const chartFilters = parseAdminDashboardChartParams(resolvedSearchParams, filters);

  return (
    <AdminDashboardPage
      lang={locale}
      dict={dict}
      filters={filters}
      chartFilters={chartFilters}
    />
  );
}
