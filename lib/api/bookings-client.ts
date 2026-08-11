// Braider Bookings endpoints — GET /braiders/me/bookings (list) and
// GET /braiders/me/bookings/{id} (detail). Requires a BRAIDER-role Bearer token.
import type {
  BookingDetailResponse,
  BookingListParams,
  BookingListResponse,
  BookingStatsResponse,
  BookingTimeseriesResponse,
  BookingStatus,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { apiFetch } from "@/lib/api/http";

const BOOKINGS_PATH = "/braiders/me/bookings";

export const bookingsApi = {
  list: (accessToken: string, lang: Locale, params: BookingListParams = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.date_from) query.set("date_from", params.date_from);
    if (params.date_to) query.set("date_to", params.date_to);
    if (params.search) query.set("search", params.search);
    query.set("page", String(params.page ?? 1));
    query.set("page_size", String(params.page_size ?? 20));
    return apiFetch<BookingListResponse>(
      `${BOOKINGS_PATH}?${query.toString()}`,
      { accessToken, lang }
    );
  },

  getById: (accessToken: string, bookingId: string, lang: Locale) =>
    apiFetch<BookingDetailResponse>(`${BOOKINGS_PATH}/${bookingId}`, {
      accessToken,
      lang,
    }),

  getStats: (
    accessToken: string,
    lang: Locale,
    params?: { date_from?: string; date_to?: string }
  ) => {
    const query = new URLSearchParams();
    if (params?.date_from) query.set("date_from", params.date_from);
    if (params?.date_to) query.set("date_to", params.date_to);
    const queryString = query.toString();
    return apiFetch<BookingStatsResponse>(
      `${BOOKINGS_PATH}/stats${queryString ? `?${queryString}` : ""}`,
      { accessToken, lang }
    );
  },

  getTimeseries: (
    accessToken: string,
    lang: Locale,
    params?: {
      date_from?: string;
      date_to?: string;
      interval?: "day" | "week" | "month";
      status?: BookingStatus[];
    }
  ) => {
    const query = new URLSearchParams();
    if (params?.date_from) query.set("date_from", params.date_from);
    if (params?.date_to) query.set("date_to", params.date_to);
    if (params?.interval) query.set("interval", params.interval);
    if (params?.status) {
      params.status.forEach((s) => query.append("status", s));
    }
    const queryString = query.toString();
    return apiFetch<BookingTimeseriesResponse>(
      `${BOOKINGS_PATH}/timeseries${queryString ? `?${queryString}` : ""}`,
      { accessToken, lang }
    );
  },
};
