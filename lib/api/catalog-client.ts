// Public style catalog endpoints — no auth required, used to build the
// SERVICE_TYPE step's style/addon pickers. Responses are locale-resolved
// server-side via Accept-Language.
import type {
  AddOnPublicResponse,
  PaginatedData,
  StyleCategoryPublicResponse,
  StylePublicResponse,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { apiFetch } from "@/lib/api/http";

export const catalogApi = {
  getStyleCategories: (lang: Locale) =>
    apiFetch<StyleCategoryPublicResponse[]>("/style-categories", { lang }),

  getStyles: (
    params: {
      categoryId?: string;
      search?: string;
      page?: number;
      pageSize?: number;
    } = {},
    lang: Locale
  ) => {
    const query = new URLSearchParams();
    if (params.categoryId) query.set("category_id", params.categoryId);
    if (params.search) query.set("search", params.search);
    query.set("page", String(params.page ?? 1));
    query.set("page_size", String(params.pageSize ?? 20));
    return apiFetch<PaginatedData<StylePublicResponse>>(
      `/styles?${query.toString()}`,
      { lang }
    );
  },

  getStyle: (styleId: string, lang: Locale) =>
    apiFetch<StylePublicResponse>(`/styles/${styleId}`, { lang }),

  getAddons: (lang: Locale) =>
    apiFetch<AddOnPublicResponse[]>("/addons", { lang }),
};
