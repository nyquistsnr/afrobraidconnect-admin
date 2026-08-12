import { apiFetch, ApiError } from "@/lib/api/http";
import type {
  AdminChatReport,
  ChatReportsListParams,
  ChatReportUpdateRequest,
  PaginatedData,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

export { ApiError };

const ADMIN_CHAT_REPORTS_PATH = "/admin/chat/reports";

export const adminChatReportsApi = {
  list: (
    accessToken: string,
    lang: Locale,
    params: ChatReportsListParams = {}
  ) => {
    const query = new URLSearchParams();
    query.set("status", params.status ?? "OPEN");
    query.set("page", String(params.page ?? 1));
    query.set("page_size", String(params.page_size ?? 20));

    return apiFetch<PaginatedData<AdminChatReport>>(
      `${ADMIN_CHAT_REPORTS_PATH}?${query.toString()}`,
      {
        accessToken,
        lang,
      }
    );
  },

  update: (
    accessToken: string,
    lang: Locale,
    reportId: string,
    body: ChatReportUpdateRequest
  ) =>
    apiFetch<AdminChatReport>(`${ADMIN_CHAT_REPORTS_PATH}/${reportId}`, {
      method: "PATCH",
      body,
      accessToken,
      lang,
    }),
};
