import { apiFetch, ApiError } from "@/lib/api/http";
import type {
  AdminReview,
  PaginatedData,
  ReviewsListParams,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

export { ApiError };

const ADMIN_REVIEWS_PATH = "/admin/reviews";

export const adminReviewsApi = {
  list: (
    accessToken: string,
    lang: Locale,
    params: ReviewsListParams = {}
  ) => {
    const query = new URLSearchParams();
    query.set("status", params.status ?? "PENDING");
    query.set("page", String(params.page ?? 1));
    query.set("page_size", String(params.page_size ?? 20));

    return apiFetch<PaginatedData<AdminReview>>(
      `${ADMIN_REVIEWS_PATH}?${query.toString()}`,
      {
        accessToken,
        lang,
      }
    );
  },

  approve: (accessToken: string, lang: Locale, reviewId: string) =>
    apiFetch<AdminReview>(`${ADMIN_REVIEWS_PATH}/${reviewId}/approve`, {
      method: "POST",
      accessToken,
      lang,
    }),

  reject: (accessToken: string, lang: Locale, reviewId: string) =>
    apiFetch<AdminReview>(`${ADMIN_REVIEWS_PATH}/${reviewId}/reject`, {
      method: "POST",
      accessToken,
      lang,
    }),
};
