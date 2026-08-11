import type {
  PaymentListResponse,
  PaymentStatsResponse,
  PaymentPurpose,
  PaymentStatus,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { apiFetch } from "@/lib/api/http";

const PAYMENTS_PATH = "/braiders/me/payments";

export const paymentsApi = {
  getStats: (
    accessToken: string,
    lang: Locale,
    params?: {
      status?: PaymentStatus;
      date_from?: string;
      date_to?: string;
    }
  ) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.date_from) query.set("date_from", params.date_from);
    if (params?.date_to) query.set("date_to", params.date_to);
    const queryString = query.toString();
    return apiFetch<PaymentStatsResponse>(
      `${PAYMENTS_PATH}/stats${queryString ? `?${queryString}` : ""}`,
      { accessToken, lang }
    );
  },

  list: (
    accessToken: string,
    lang: Locale,
    params?: {
      purpose?: PaymentPurpose;
      status?: PaymentStatus;
      date_from?: string;
      date_to?: string;
      page?: number;
      page_size?: number;
    }
  ) => {
    const query = new URLSearchParams();
    if (params?.purpose) query.set("purpose", params.purpose);
    if (params?.status) query.set("status", params.status);
    if (params?.date_from) query.set("date_from", params.date_from);
    if (params?.date_to) query.set("date_to", params.date_to);
    query.set("page", String(params?.page ?? 1));
    query.set("page_size", String(params?.page_size ?? 20));
    
    const queryString = query.toString();
    return apiFetch<PaymentListResponse>(
      `${PAYMENTS_PATH}${queryString ? `?${queryString}` : ""}`,
      { accessToken, lang }
    );
  },
};
