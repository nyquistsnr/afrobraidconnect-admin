import { apiFetch, ApiError } from "@/lib/api/http";
import type {
  AdminPaymentListItem,
  AdminPaymentsListParams,
  PaginatedData,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

export { ApiError };

const ADMIN_PAYMENTS_PATH = "/admin/payments";

function appendParam(
  query: URLSearchParams,
  key: string,
  value: string | number | boolean | undefined
) {
  if (value === undefined || value === "") return;
  query.set(key, String(value));
}

function buildQuery(params: AdminPaymentsListParams) {
  const query = new URLSearchParams();
  appendParam(query, "purpose", params.purpose);
  appendParam(query, "status", params.status);
  appendParam(query, "date_from", params.date_from);
  appendParam(query, "date_to", params.date_to);
  appendParam(query, "booking_date_from", params.booking_date_from);
  appendParam(query, "booking_date_to", params.booking_date_to);
  appendParam(query, "customer_id", params.customer_id);
  appendParam(query, "braider_id", params.braider_id);
  appendParam(query, "booking_id", params.booking_id);
  appendParam(query, "currency", params.currency);
  appendParam(query, "is_refunded", params.is_refunded);
  appendParam(query, "search", params.search);
  appendParam(query, "page", params.page ?? 1);
  appendParam(query, "page_size", Math.min(params.page_size ?? 20, 100));
  return query.toString();
}

export const adminPaymentsApi = {
  list: (
    accessToken: string,
    lang: Locale,
    params: AdminPaymentsListParams = {}
  ) =>
    apiFetch<PaginatedData<AdminPaymentListItem>>(
      `${ADMIN_PAYMENTS_PATH}?${buildQuery(params)}`,
      {
        accessToken,
        lang,
      }
    ),
};
