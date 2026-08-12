import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
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
  type AdminDashboardCharts,
} from "@/components/dashboard/admin-dashboard/admin-dashboard-page";
import { adminDashboardApi } from "@/lib/api/admin-dashboard-client";
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
  const session = await auth();
  if (!session?.accessToken || session.user.userType !== "ADMIN") {
    redirect(`/${locale}/login`);
  }

  const resolvedSearchParams = await searchParams;
  const dict = getAdminDashboardDict(locale);
  const filters = parseAdminDashboardFilters(resolvedSearchParams);
  const chartFilters = parseAdminDashboardChartParams(resolvedSearchParams, filters);

  const [overviewResult, financialsResult, chartsResult] = await Promise.allSettled([
    adminDashboardApi.overview(session.accessToken, locale, filters),
    adminDashboardApi.financials(session.accessToken, locale, filters),
    fetchDashboardCharts(session.accessToken, locale, chartFilters),
  ]);

  const overview =
    overviewResult.status === "fulfilled" ? overviewResult.value : null;
  const financials =
    financialsResult.status === "fulfilled" ? financialsResult.value : null;
  const charts =
    chartsResult.status === "fulfilled" ? chartsResult.value.charts : emptyCharts();
  const loadError =
    overviewResult.status === "rejected" ||
    financialsResult.status === "rejected" ||
    chartsResult.status === "rejected" ||
    (chartsResult.status === "fulfilled" && chartsResult.value.failed);

  logRejected("admin dashboard overview", overviewResult);
  logRejected("admin dashboard financials", financialsResult);
  if (chartsResult.status === "rejected") {
    console.warn(
      "Failed to load admin dashboard charts:",
      chartsResult.reason instanceof Error ? chartsResult.reason.message : chartsResult.reason
    );
  }

  return (
    <AdminDashboardPage
      lang={locale}
      dict={dict}
      filters={filters}
      chartFilters={chartFilters}
      overview={overview}
      financials={financials}
      charts={charts}
      loadError={loadError}
    />
  );
}

async function fetchDashboardCharts(
  accessToken: string,
  locale: Locale,
  chartFilters: ReturnType<typeof parseAdminDashboardChartParams>
): Promise<{ charts: AdminDashboardCharts; failed: boolean }> {
  const chartNames = ["revenue", "weekday", "status", "countries", "styles"] as const;
  const results = await Promise.allSettled(
    chartNames.map((chart) =>
      adminDashboardApi.chart(accessToken, locale, chart, chartFilters)
    )
  );
  const values = results.map((result) =>
    result.status === "fulfilled" ? result.value : null
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.warn(
        `Failed to load admin dashboard ${chartNames[index]} chart:`,
        result.reason instanceof Error ? result.reason.message : result.reason
      );
    }
  });

  return {
    charts: {
      revenue: values[0],
      weekday: values[1],
      status: values[2],
      countries: values[3],
      styles: values[4],
    },
    failed: results.some((result) => result.status === "rejected"),
  };
}

function emptyCharts(): AdminDashboardCharts {
  return {
    revenue: null,
    weekday: null,
    status: null,
    countries: null,
    styles: null,
  };
}

function logRejected<T>(
  label: string,
  result: PromiseSettledResult<T>
) {
  if (result.status === "rejected") {
    console.warn(
      `Failed to load ${label}:`,
      result.reason instanceof Error ? result.reason.message : result.reason
    );
  }
}
