import type {
  DashboardOverviewResponse,
  DashboardRevenueTimeseriesResponse,
  DashboardBookingsByWeekdayResponse,
  DashboardStyleBreakdownResponse,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { apiFetch } from "@/lib/api/http";

const DASHBOARD_PATH = "/braiders/me/dashboard";

export const dashboardApi = {
  getOverview: (
    accessToken: string,
    lang: Locale,
    params?: { date_from?: string; date_to?: string }
  ) => {
    const query = new URLSearchParams();
    if (params?.date_from) query.set("date_from", params.date_from);
    if (params?.date_to) query.set("date_to", params.date_to);
    const queryString = query.toString();
    return apiFetch<DashboardOverviewResponse>(
      `${DASHBOARD_PATH}/overview${queryString ? `?${queryString}` : ""}`,
      { accessToken, lang }
    );
  },

  getRevenueTimeseries: (
    accessToken: string,
    lang: Locale,
    params?: {
      date_from?: string;
      date_to?: string;
      interval?: "day" | "week" | "month";
    }
  ) => {
    const query = new URLSearchParams();
    if (params?.date_from) query.set("date_from", params.date_from);
    if (params?.date_to) query.set("date_to", params.date_to);
    if (params?.interval) query.set("interval", params.interval);
    const queryString = query.toString();
    return apiFetch<DashboardRevenueTimeseriesResponse>(
      `${DASHBOARD_PATH}/revenue-timeseries${
        queryString ? `?${queryString}` : ""
      }`,
      { accessToken, lang }
    );
  },

  getBookingsByWeekday: (
    accessToken: string,
    lang: Locale,
    params?: { date_from?: string; date_to?: string }
  ) => {
    const query = new URLSearchParams();
    if (params?.date_from) query.set("date_from", params.date_from);
    if (params?.date_to) query.set("date_to", params.date_to);
    const queryString = query.toString();
    return apiFetch<DashboardBookingsByWeekdayResponse>(
      `${DASHBOARD_PATH}/bookings-by-weekday${
        queryString ? `?${queryString}` : ""
      }`,
      { accessToken, lang }
    );
  },

  getStyleBreakdown: (
    accessToken: string,
    lang: Locale,
    params?: { date_from?: string; date_to?: string }
  ) => {
    const query = new URLSearchParams();
    if (params?.date_from) query.set("date_from", params.date_from);
    if (params?.date_to) query.set("date_to", params.date_to);
    const queryString = query.toString();
    return apiFetch<DashboardStyleBreakdownResponse>(
      `${DASHBOARD_PATH}/style-breakdown${
        queryString ? `?${queryString}` : ""
      }`,
      { accessToken, lang }
    );
  },
};
