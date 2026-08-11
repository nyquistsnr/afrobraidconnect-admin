import type { AdminUserResponse, SuspendUserRequest, PaginatedData } from "@/lib/api/types";
import { apiFetch, apiFetchWithEnvelope, ApiError } from "@/lib/api/http";
import type { Locale } from "@/lib/i18n";

export { ApiError };

const ADMIN_USERS_PATH = "/admin/users";

export interface GetUsersParams {
  user_type?: string;
  page?: number;
  page_size?: number;
}

export const adminUsersApi = {
  getUsers: (accessToken: string, lang: Locale, params?: GetUsersParams) => {
    const searchParams = new URLSearchParams();
    if (params?.user_type) searchParams.set("user_type", params.user_type);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.page_size) searchParams.set("page_size", params.page_size.toString());
    
    const qs = searchParams.toString();
    const url = qs ? `${ADMIN_USERS_PATH}?${qs}` : ADMIN_USERS_PATH;

    return apiFetch<PaginatedData<AdminUserResponse>>(url, {
      method: "GET",
      accessToken,
      lang,
    });
  },

  suspendUser: (
    userId: string,
    body: SuspendUserRequest,
    accessToken: string,
    lang: Locale
  ) =>
    apiFetchWithEnvelope<AdminUserResponse>(`${ADMIN_USERS_PATH}/${userId}/suspend`, {
      method: "POST",
      body,
      accessToken,
      lang,
    }),

  unsuspendUser: (userId: string, accessToken: string, lang: Locale) =>
    apiFetchWithEnvelope<AdminUserResponse>(`${ADMIN_USERS_PATH}/${userId}/unsuspend`, {
      method: "POST",
      body: {},
      accessToken,
      lang,
    }),
};
