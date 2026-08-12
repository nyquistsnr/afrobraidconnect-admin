import { apiFetch, ApiError } from "@/lib/api/http";
import type {
  AdminContactSubmission,
  AdminContactSubmissionsListParams,
  PaginatedData,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

export { ApiError };

const ADMIN_CONTACT_SUBMISSIONS_PATH = "/admin/contact-submissions";

function appendParam(
  query: URLSearchParams,
  key: string,
  value: string | number | boolean | undefined
) {
  if (value === undefined || value === "") return;
  query.set(key, String(value));
}

function buildQuery(params: AdminContactSubmissionsListParams) {
  const query = new URLSearchParams();
  appendParam(query, "platform", params.platform);
  appendParam(query, "purpose", params.purpose);
  appendParam(query, "is_read", params.is_read);
  appendParam(query, "date_from", params.date_from);
  appendParam(query, "date_to", params.date_to);
  appendParam(query, "search", params.search);
  appendParam(query, "page", params.page ?? 1);
  appendParam(query, "page_size", Math.min(params.page_size ?? 20, 100));
  return query.toString();
}

export const adminContactSubmissionsApi = {
  list: (
    accessToken: string,
    lang: Locale,
    params: AdminContactSubmissionsListParams = {}
  ) =>
    apiFetch<PaginatedData<AdminContactSubmission>>(
      `${ADMIN_CONTACT_SUBMISSIONS_PATH}?${buildQuery(params)}`,
      {
        accessToken,
        lang,
      }
    ),

  get: (accessToken: string, lang: Locale, submissionId: string) =>
    apiFetch<AdminContactSubmission>(
      `${ADMIN_CONTACT_SUBMISSIONS_PATH}/${encodeURIComponent(submissionId)}`,
      {
        accessToken,
        lang,
      }
    ),

  markRead: (accessToken: string, lang: Locale, submissionId: string) =>
    apiFetch<AdminContactSubmission | null>(
      `${ADMIN_CONTACT_SUBMISSIONS_PATH}/${encodeURIComponent(
        submissionId
      )}/mark-read`,
      {
        method: "POST",
        accessToken,
        lang,
      }
    ),

  markUnread: (accessToken: string, lang: Locale, submissionId: string) =>
    apiFetch<AdminContactSubmission | null>(
      `${ADMIN_CONTACT_SUBMISSIONS_PATH}/${encodeURIComponent(
        submissionId
      )}/mark-unread`,
      {
        method: "POST",
        accessToken,
        lang,
      }
    ),
};
