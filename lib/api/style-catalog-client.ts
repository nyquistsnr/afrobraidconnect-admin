import { apiFetch } from "@/lib/api/http";
import type { AdminAddon, AdminStyle, PaginatedData, StyleCategory, StyleImage, StyleVariation } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

const base = "/admin";
const request = <T>(path: string, token: string, lang: Locale, method: "GET" | "POST" | "PUT" | "DELETE" = "GET", body?: unknown) =>
  apiFetch<T>(path, { method, body, accessToken: token, lang });

export const styleCatalogApi = {
  categories: (token: string, lang: Locale) => request<StyleCategory[]>(`${base}/style-categories`, token, lang),
  createCategory: (body: { name: string; display_order?: number }, token: string, lang: Locale) => request<StyleCategory>(`${base}/style-categories`, token, lang, "POST", body),
  updateCategory: (id: string, body: { name?: string; display_order?: number }, token: string, lang: Locale) => request<StyleCategory>(`${base}/style-categories/${id}`, token, lang, "PUT", body),
  deleteCategory: (id: string, token: string, lang: Locale) => request<void>(`${base}/style-categories/${id}`, token, lang, "DELETE"),
  styles: (token: string, lang: Locale, page = 1, search = "") => request<PaginatedData<AdminStyle>>(`${base}/styles?page=${page}&page_size=20${search ? `&search=${encodeURIComponent(search)}` : ""}`, token, lang),
  createStyle: (body: { name: string; description?: string; category_id?: string | null }, token: string, lang: Locale) => request<AdminStyle>(`${base}/styles`, token, lang, "POST", body),
  updateStyle: (id: string, body: Partial<{ name: string; description: string; category_id: string; is_active: boolean }>, token: string, lang: Locale) => request<AdminStyle>(`${base}/styles/${id}`, token, lang, "PUT", body),
  deleteStyle: (id: string, token: string, lang: Locale) => request<void>(`${base}/styles/${id}`, token, lang, "DELETE"),
  createVariation: (styleId: string, body: { name: string; display_order?: number }, token: string, lang: Locale) => request<StyleVariation>(`${base}/styles/${styleId}/variations`, token, lang, "POST", body),
  updateVariation: (styleId: string, id: string, body: Partial<{ name: string; display_order: number; is_active: boolean }>, token: string, lang: Locale) => request<StyleVariation>(`${base}/styles/${styleId}/variations/${id}`, token, lang, "PUT", body),
  deleteVariation: (styleId: string, id: string, token: string, lang: Locale) => request<void>(`${base}/styles/${styleId}/variations/${id}`, token, lang, "DELETE"),
  deleteImage: (styleId: string, id: string, token: string, lang: Locale) => request<void>(`${base}/styles/${styleId}/images/${id}`, token, lang, "DELETE"),
  uploadUrl: (styleId: string, content_type: string, token: string, lang: Locale) => request<{ upload_url: string; object_key: string }>(`${base}/styles/${styleId}/images/upload-url`, token, lang, "POST", { content_type }),
  confirmImage: (styleId: string, object_key: string, token: string, lang: Locale) => request<StyleImage>(`${base}/styles/${styleId}/images/confirm`, token, lang, "POST", { object_key }),
  addons: (token: string, lang: Locale) => request<AdminAddon[]>(`${base}/addons`, token, lang),
  createAddon: (body: { name: string; suggested_price?: string }, token: string, lang: Locale) => request<AdminAddon>(`${base}/addons`, token, lang, "POST", body),
  updateAddon: (id: string, body: Partial<{ name: string; suggested_price: string; is_active: boolean }>, token: string, lang: Locale) => request<AdminAddon>(`${base}/addons/${id}`, token, lang, "PUT", body),
  deleteAddon: (id: string, token: string, lang: Locale) => request<void>(`${base}/addons/${id}`, token, lang, "DELETE"),
};
