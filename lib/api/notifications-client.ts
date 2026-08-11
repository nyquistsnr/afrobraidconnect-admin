// Generic notifications — currently only emitted by chat (new message /
// message-withheld), but works the same for any future emitter.
import type { Notification, NotificationListParams, PaginatedData } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { apiFetch } from "@/lib/api/http";

const NOTIFICATIONS_PATH = "/notifications";

export const notificationsApi = {
  list: (accessToken: string, lang: Locale, params: NotificationListParams = {}) => {
    const query = new URLSearchParams();
    if (params.is_read !== undefined) query.set("is_read", String(params.is_read));
    // URLSearchParams percent-encodes "+" as %2B on its own (application/
    // x-www-form-urlencoded serialization), which is exactly what a raw UTC
    // offset like +00:00 needs — no manual encoding required here.
    if (params.date_from) query.set("date_from", params.date_from);
    if (params.date_to) query.set("date_to", params.date_to);
    query.set("page", String(params.page ?? 1));
    query.set("page_size", String(params.page_size ?? 20));
    return apiFetch<PaginatedData<Notification>>(
      `${NOTIFICATIONS_PATH}?${query.toString()}`,
      { accessToken, lang }
    );
  },

  markRead: (accessToken: string, notificationId: string, lang: Locale) =>
    apiFetch<Notification>(`${NOTIFICATIONS_PATH}/${notificationId}/read`, {
      method: "PATCH",
      accessToken,
      lang,
    }),

  markAllRead: (accessToken: string, lang: Locale) =>
    apiFetch<{ marked_count: number }>(`${NOTIFICATIONS_PATH}/read-all`, {
      method: "POST",
      accessToken,
      lang,
    }),

  remove: (accessToken: string, notificationId: string, lang: Locale) =>
    apiFetch<{ message: string }>(`${NOTIFICATIONS_PATH}/${notificationId}`, {
      method: "DELETE",
      accessToken,
      lang,
    }),
};
