import { apiFetch, ApiError } from "@/lib/api/http";
import type {
  AdminBookingDetail,
  AdminBookingChartParams,
  AdminBookingListItem,
  AdminBookingStats,
  AdminBookingStatsParams,
  AdminChartResponse,
  AdminBookingsListParams,
  PaginatedData,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

export { ApiError };

const ADMIN_BOOKINGS_PATH = "/admin/bookings";

function appendParam(
  query: URLSearchParams,
  key: string,
  value: string | number | boolean | undefined
) {
  if (value === undefined || value === "") return;
  query.set(key, String(value));
}

function buildQuery(params: AdminBookingsListParams) {
  const query = new URLSearchParams();
  appendParam(query, "status", params.status);
  appendParam(query, "date_from", params.date_from);
  appendParam(query, "date_to", params.date_to);
  appendParam(query, "created_from", params.created_from);
  appendParam(query, "created_to", params.created_to);
  appendParam(query, "customer_id", params.customer_id);
  appendParam(query, "braider_id", params.braider_id);
  appendParam(query, "country", params.country);
  appendParam(query, "currency", params.currency);
  appendParam(query, "is_mobile", params.is_mobile);
  appendParam(query, "payment_schedule", params.payment_schedule);
  appendParam(query, "search", params.search);
  appendParam(query, "page", params.page ?? 1);
  appendParam(query, "page_size", Math.min(params.page_size ?? 20, 100));
  return query.toString();
}

function buildStatsQuery(params: AdminBookingStatsParams) {
  const query = new URLSearchParams();
  appendParam(query, "status", params.status);
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
  return query.toString();
}

function buildChartQuery(params: AdminBookingChartParams) {
  const query = new URLSearchParams(buildStatsQuery(params));
  appendParam(query, "interval", params.interval);
  appendParam(query, "limit", params.limit);
  return query.toString();
}

function withQuery(path: string, query: string) {
  return query ? `${path}?${query}` : path;
}

export const adminBookingsApi = {
  list: (
    accessToken: string,
    lang: Locale,
    params: AdminBookingsListParams = {}
  ) =>
    apiFetch<PaginatedData<AdminBookingListItem>>(
      `${ADMIN_BOOKINGS_PATH}?${buildQuery(params)}`,
      {
        accessToken,
        lang,
      }
    ),

  get: (accessToken: string, lang: Locale, bookingId: string) =>
    apiFetch<AdminBookingDetail>(
      `${ADMIN_BOOKINGS_PATH}/${encodeURIComponent(bookingId)}`,
      {
        accessToken,
        lang,
      }
    ),

  listForBraider: (
    accessToken: string,
    lang: Locale,
    braiderId: string,
    params: AdminBookingsListParams = {}
  ) =>
    apiFetch<PaginatedData<AdminBookingListItem>>(
      withQuery(
        `${ADMIN_BOOKINGS_PATH}/braiders/${encodeURIComponent(braiderId)}`,
        buildQuery(params)
      ),
      {
        accessToken,
        lang,
      }
    ),

  listForCustomer: (
    accessToken: string,
    lang: Locale,
    customerId: string,
    params: AdminBookingsListParams = {}
  ) =>
    apiFetch<PaginatedData<AdminBookingListItem>>(
      withQuery(
        `${ADMIN_BOOKINGS_PATH}/customers/${encodeURIComponent(customerId)}`,
        buildQuery(params)
      ),
      {
        accessToken,
        lang,
      }
    ),

  listForBraiderCustomer: (
    accessToken: string,
    lang: Locale,
    braiderId: string,
    customerId: string,
    params: AdminBookingsListParams = {}
  ) =>
    apiFetch<PaginatedData<AdminBookingListItem>>(
      withQuery(
        `${ADMIN_BOOKINGS_PATH}/braiders/${encodeURIComponent(
          braiderId
        )}/customers/${encodeURIComponent(customerId)}`,
        buildQuery(params)
      ),
      {
        accessToken,
        lang,
      }
    ),

  statsForBraider: (
    accessToken: string,
    lang: Locale,
    braiderId: string,
    params: AdminBookingStatsParams = {}
  ) =>
    apiFetch<AdminBookingStats>(
      withQuery(
        `${ADMIN_BOOKINGS_PATH}/braiders/${encodeURIComponent(braiderId)}/stats`,
        buildStatsQuery(params)
      ),
      {
        accessToken,
        lang,
      }
    ),

  statsForCustomer: (
    accessToken: string,
    lang: Locale,
    customerId: string,
    params: AdminBookingStatsParams = {}
  ) =>
    apiFetch<AdminBookingStats>(
      withQuery(
        `${ADMIN_BOOKINGS_PATH}/customers/${encodeURIComponent(customerId)}/stats`,
        buildStatsQuery(params)
      ),
      {
        accessToken,
        lang,
      }
    ),

  statsForBraiderCustomer: (
    accessToken: string,
    lang: Locale,
    braiderId: string,
    customerId: string,
    params: AdminBookingStatsParams = {}
  ) =>
    apiFetch<AdminBookingStats>(
      withQuery(
        `${ADMIN_BOOKINGS_PATH}/braiders/${encodeURIComponent(
          braiderId
        )}/customers/${encodeURIComponent(customerId)}/stats`,
        buildStatsQuery(params)
      ),
      {
        accessToken,
        lang,
      }
    ),

  chartForBraider: (
    accessToken: string,
    lang: Locale,
    braiderId: string,
    chart: "revenue" | "weekday" | "status" | "styles",
    params: AdminBookingChartParams = {}
  ) =>
    apiFetch<AdminChartResponse>(
      withQuery(
        `${ADMIN_BOOKINGS_PATH}/braiders/${encodeURIComponent(
          braiderId
        )}/charts/${chart}`,
        buildChartQuery(params)
      ),
      {
        accessToken,
        lang,
      }
    ),

  chartForCustomer: (
    accessToken: string,
    lang: Locale,
    customerId: string,
    chart: "revenue" | "weekday" | "status" | "styles",
    params: AdminBookingChartParams = {}
  ) =>
    apiFetch<AdminChartResponse>(
      withQuery(
        `${ADMIN_BOOKINGS_PATH}/customers/${encodeURIComponent(
          customerId
        )}/charts/${chart}`,
        buildChartQuery(params)
      ),
      {
        accessToken,
        lang,
      }
    ),

  chartForBraiderCustomer: (
    accessToken: string,
    lang: Locale,
    braiderId: string,
    customerId: string,
    chart: "revenue" | "weekday" | "status" | "styles",
    params: AdminBookingChartParams = {}
  ) =>
    apiFetch<AdminChartResponse>(
      withQuery(
        `${ADMIN_BOOKINGS_PATH}/braiders/${encodeURIComponent(
          braiderId
        )}/customers/${encodeURIComponent(customerId)}/charts/${chart}`,
        buildChartQuery(params)
      ),
      {
        accessToken,
        lang,
      }
    ),
};
