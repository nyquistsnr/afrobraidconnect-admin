"use client";

import type { AdminBookingsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import { extractPagination } from "@/components/dashboard/admin-commerce/formatters";
import type { ScopedChartsData } from "@/components/dashboard/bookings/scoped-booking-charts";
import { ScopedBookingsLoading } from "@/components/dashboard/bookings/scoped-bookings-loading";
import { ScopedBookingsPage } from "@/components/dashboard/bookings/scoped-bookings-page";
import { adminBraidersApi } from "@/lib/api/admin-braiders-client";
import { adminBookingsApi } from "@/lib/api/admin-bookings-client";
import type {
  AdminBookingChartParams,
  AdminBookingStatsParams,
  AdminBookingsListParams,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { adminKeys } from "@/lib/query-keys";
import { useAdminQuery } from "@/lib/use-admin-query";

export type ScopeKind = "braider" | "customer" | "relationship";

type Scope = {
  scopeKind: ScopeKind;
  braiderId?: string;
  customerId?: string;
};

function listBookings(token: string, lang: Locale, scope: Scope, filters: AdminBookingsListParams) {
  const { scopeKind, braiderId, customerId } = scope;
  if (scopeKind === "relationship" && braiderId && customerId) {
    return adminBookingsApi.listForBraiderCustomer(token, lang, braiderId, customerId, filters);
  }
  if (scopeKind === "braider" && braiderId) {
    return adminBookingsApi.listForBraider(token, lang, braiderId, filters);
  }
  if (customerId) return adminBookingsApi.listForCustomer(token, lang, customerId, filters);
  return Promise.resolve(null);
}

function loadStats(token: string, lang: Locale, scope: Scope, filters: AdminBookingStatsParams) {
  const { scopeKind, braiderId, customerId } = scope;
  if (scopeKind === "relationship" && braiderId && customerId) {
    return adminBookingsApi.statsForBraiderCustomer(token, lang, braiderId, customerId, filters);
  }
  if (scopeKind === "braider" && braiderId) {
    return adminBookingsApi.statsForBraider(token, lang, braiderId, filters);
  }
  if (customerId) return adminBookingsApi.statsForCustomer(token, lang, customerId, filters);
  return Promise.resolve(null);
}

async function loadCharts(
  token: string,
  lang: Locale,
  scope: Scope,
  filters: AdminBookingChartParams
): Promise<{ charts: ScopedChartsData; failed: boolean }> {
  const { scopeKind, braiderId, customerId } = scope;
  const chartNames = ["revenue", "weekday", "status", "styles"] as const;
  const results = await Promise.allSettled(
    chartNames.map(async (chart) => {
      if (scopeKind === "relationship" && braiderId && customerId) {
        return adminBookingsApi.chartForBraiderCustomer(token, lang, braiderId, customerId, chart, filters);
      }
      if (scopeKind === "braider" && braiderId) {
        return adminBookingsApi.chartForBraider(token, lang, braiderId, chart, filters);
      }
      if (customerId) return adminBookingsApi.chartForCustomer(token, lang, customerId, chart, filters);
      return null;
    })
  );
  const values = results.map((result) => (result.status === "fulfilled" ? result.value : null));
  return {
    charts: { revenue: values[0], weekday: values[1], status: values[2], styles: values[3] },
    failed: results.some((result) => result.status === "rejected"),
  };
}

function scopedTitle(scopeKind: ScopeKind) {
  if (scopeKind === "relationship") return "Braider and customer bookings";
  if (scopeKind === "braider") return "Braider bookings";
  return "Customer bookings";
}

function scopedSubtitle(scopeKind: ScopeKind, braiderId?: string, customerId?: string) {
  if (scopeKind === "relationship") {
    return `Braider ${braiderId || "-"} with customer ${customerId || "-"}`;
  }
  if (scopeKind === "braider") return `Braider profile ${braiderId || "-"}`;
  return `Customer ${customerId || "-"}`;
}

export function ScopedBookingsPageClient({
  lang,
  dict,
  scopeKind,
  braiderId,
  customerId,
  filters,
  statsFilters,
  chartFilters,
}: Scope & {
  lang: Locale;
  dict: AdminBookingsDict;
  filters: AdminBookingsListParams;
  statsFilters: AdminBookingStatsParams;
  chartFilters: AdminBookingChartParams;
}) {
  const scope = { scopeKind, braiderId, customerId };
  const base = [...adminKeys.bookings, "scoped", lang, scopeKind, braiderId ?? "", customerId ?? ""];

  // Four independent queries: they run in parallel and each is cached on its own,
  // so changing the list page doesn't refetch stats, charts or onboarding.
  const listQuery = useAdminQuery([...base, "list", filters], (token) =>
    listBookings(token, lang, scope, filters)
  );
  const statsQuery = useAdminQuery([...base, "stats", statsFilters], (token) =>
    loadStats(token, lang, scope, statsFilters)
  );
  const onboardingQuery = useAdminQuery(
    [...adminKeys.bookings, "onboarding", lang, braiderId ?? ""],
    (token) => adminBraidersApi.getOnboarding(token, lang, braiderId!),
    { enabled: Boolean(braiderId) }
  );
  const chartsQuery = useAdminQuery([...base, "charts", chartFilters], (token) =>
    loadCharts(token, lang, scope, chartFilters)
  );

  if (listQuery.isPending) return <ScopedBookingsLoading withOnboarding={Boolean(braiderId)} />;

  const bookings = Array.isArray(listQuery.data?.items) ? listQuery.data.items : [];
  const pagination = extractPagination(listQuery.data, filters.page ?? 1, filters.page_size ?? 20, bookings.length);

  return (
    <ScopedBookingsPage
      lang={lang}
      dict={dict}
      scopeKind={scopeKind}
      title={scopedTitle(scopeKind)}
      subtitle={scopedSubtitle(scopeKind, braiderId, customerId)}
      stats={statsQuery.data ?? null}
      statsLoadError={statsQuery.isError}
      onboarding={onboardingQuery.data ?? null}
      onboardingLoadError={onboardingQuery.isError}
      charts={chartsQuery.data?.charts ?? { revenue: null, weekday: null, status: null, styles: null }}
      chartsLoadError={chartsQuery.isError || Boolean(chartsQuery.data?.failed)}
      bookings={bookings}
      pagination={pagination}
      filters={filters}
      initialLoadError={listQuery.isError}
    />
  );
}
