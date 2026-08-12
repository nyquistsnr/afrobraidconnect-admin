import { apiFetch, ApiError } from "@/lib/api/http";
import type {
  AdminChartResponse,
  AdminDashboardChartParams,
  AdminDashboardFilters,
  AdminDashboardFinancials,
  AdminDashboardOverview,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

export { ApiError };

const ADMIN_DASHBOARD_PATH = "/admin/dashboard";

function appendParam(
  query: URLSearchParams,
  key: string,
  value: string | number | boolean | undefined
) {
  if (value === undefined || value === "") return;
  query.set(key, String(value));
}

function buildSummaryQuery(params: AdminDashboardFilters) {
  const query = new URLSearchParams();
  appendParam(query, "date_from", params.date_from);
  appendParam(query, "date_to", params.date_to);
  appendParam(query, "created_from", params.created_from);
  appendParam(query, "created_to", params.created_to);
  appendParam(query, "payment_date_from", params.payment_date_from);
  appendParam(query, "payment_date_to", params.payment_date_to);
  appendParam(query, "country", params.country);
  appendParam(query, "currency", params.currency);
  appendParam(query, "is_mobile", params.is_mobile);
  appendParam(query, "payment_schedule", params.payment_schedule);
  appendParam(query, "search", params.search);
  appendParam(query, "status", params.status);
  return query.toString();
}

function buildChartQuery(params: AdminDashboardChartParams) {
  const query = new URLSearchParams();
  appendParam(query, "date_from", params.date_from);
  appendParam(query, "date_to", params.date_to);
  appendParam(query, "country", params.country);
  appendParam(query, "currency", params.currency);
  appendParam(query, "is_mobile", params.is_mobile);
  appendParam(query, "payment_schedule", params.payment_schedule);
  appendParam(query, "search", params.search);
  appendParam(query, "interval", params.interval);
  appendParam(query, "limit", params.limit);
  return query.toString();
}

function withQuery(path: string, query: string) {
  return query ? `${path}?${query}` : path;
}

export const adminDashboardApi = {
  overview: (
    accessToken: string,
    lang: Locale,
    params: AdminDashboardFilters = {}
  ) =>
    apiFetch<AdminDashboardOverview>(
      withQuery(`${ADMIN_DASHBOARD_PATH}/overview`, buildSummaryQuery(params)),
      { accessToken, lang }
    ),

  financials: (
    accessToken: string,
    lang: Locale,
    params: AdminDashboardFilters = {}
  ) =>
    apiFetch<AdminDashboardFinancials>(
      withQuery(`${ADMIN_DASHBOARD_PATH}/financials`, buildSummaryQuery(params)),
      { accessToken, lang }
    ),

  chart: (
    accessToken: string,
    lang: Locale,
    chart: "revenue" | "weekday" | "status" | "countries" | "styles",
    params: AdminDashboardChartParams = {}
  ) =>
    apiFetch<AdminChartResponse>(
      withQuery(`${ADMIN_DASHBOARD_PATH}/charts/${chart}`, buildChartQuery(params)),
      { accessToken, lang }
    ),
};
