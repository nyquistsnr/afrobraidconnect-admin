import { apiFetch, ApiError } from "@/lib/api/http";
import type {
  AdminBookingDetail,
  AdminBookingListItem,
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
};
