// In-app chat endpoints — one thread per booking, between that booking's
// customer and braider. See lib/realtime/realtime-provider.tsx for the
// WebSocket push channel that keeps threads/messages in sync live.
import type {
  ChatMessage,
  ChatReportRequest,
  ChatReportResponse,
  ChatThread,
  PaginatedData,
  SendChatMessageRequest,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { apiFetch } from "@/lib/api/http";

const CHAT_PATH = "/chat";

export interface ChatPageParams {
  page?: number;
  page_size?: number;
}

export const chatApi = {
  listThreads: (accessToken: string, lang: Locale, params: ChatPageParams = {}) => {
    const query = new URLSearchParams();
    query.set("page", String(params.page ?? 1));
    query.set("page_size", String(params.page_size ?? 20));
    return apiFetch<PaginatedData<ChatThread>>(
      `${CHAT_PATH}/threads?${query.toString()}`,
      { accessToken, lang }
    );
  },

  // Creates the thread on first call. Only succeeds once the booking's
  // deposit (or full payment) has gone through — gate the "Chat" button on
  // booking/payment status client-side rather than relying on the
  // CHAT_NOT_AVAILABLE error this throws.
  getBookingThread: (accessToken: string, bookingId: string, lang: Locale) =>
    apiFetch<ChatThread>(`${CHAT_PATH}/bookings/${bookingId}/thread`, {
      accessToken,
      lang,
    }),

  listMessages: (
    accessToken: string,
    threadId: string,
    lang: Locale,
    params: ChatPageParams = {}
  ) => {
    const query = new URLSearchParams();
    query.set("page", String(params.page ?? 1));
    query.set("page_size", String(params.page_size ?? 20));
    return apiFetch<PaginatedData<ChatMessage>>(
      `${CHAT_PATH}/threads/${threadId}/messages?${query.toString()}`,
      { accessToken, lang }
    );
  },

  // Returns 200 even when the message comes back FLAGGED — that's not an
  // error, just a redacted message (see ChatMessage.body/violation_notice).
  sendMessage: (accessToken: string, threadId: string, body: string, lang: Locale) =>
    apiFetch<ChatMessage>(`${CHAT_PATH}/threads/${threadId}/messages`, {
      method: "POST",
      body: { body } satisfies SendChatMessageRequest,
      accessToken,
      lang,
    }),

  markRead: (accessToken: string, threadId: string, lang: Locale) =>
    apiFetch<ChatThread>(`${CHAT_PATH}/threads/${threadId}/read`, {
      method: "POST",
      accessToken,
      lang,
    }),

  report: (
    accessToken: string,
    threadId: string,
    payload: ChatReportRequest,
    lang: Locale
  ) =>
    apiFetch<ChatReportResponse>(`${CHAT_PATH}/threads/${threadId}/report`, {
      method: "POST",
      body: payload,
      accessToken,
      lang,
    }),
};
