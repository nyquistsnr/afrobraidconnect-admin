import type { UserPublic, UserProfileUpdateRequest } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { apiFetch } from "@/lib/api/http";

const USERS_PATH = "/users";

export const usersApi = {
  getMe: (accessToken: string, lang: Locale) =>
    apiFetch<UserPublic>(`${USERS_PATH}/me`, { accessToken, lang }),

  updateMe: (accessToken: string, updates: UserProfileUpdateRequest, lang: Locale) =>
    apiFetch<UserPublic>(`${USERS_PATH}/me`, {
      method: "PATCH",
      body: updates,
      accessToken,
      lang,
    }),
};
