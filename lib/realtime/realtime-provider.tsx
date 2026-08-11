"use client";

// Single WebSocket connection for the whole dashboard (mounted once in
// DashboardShell) — pushes live chat messages, translations, and
// notifications into the React Query cache that the rest of the app reads
// from. Renders nothing; it's push-only from the server, so there's nothing
// to send after connecting.
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { ChatMessage, PaginatedData, RealtimeEvent } from "@/lib/api/types";

const BASE_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;
// Server closes with this code before completing the handshake on a bad/
// expired token — retrying with the same token would just fail again.
const AUTH_FAILURE_CLOSE_CODE = 4401;

function getWebSocketUrl(accessToken: string): string | null {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) return null;
  // NEXT_PUBLIC_API_BASE_URL already ends in /api/v1, so the ws endpoint is
  // just that same origin/path with the scheme swapped and /ws appended —
  // no separate NEXT_PUBLIC_WS_BASE_URL env var needed.
  const wsBase = apiBase.replace(/^http/, "ws");
  return `${wsBase}/ws?token=${encodeURIComponent(accessToken)}`;
}

function handleRealtimeEvent(queryClient: QueryClient, event: RealtimeEvent) {
  switch (event.type) {
    case "chat_message": {
      const { thread_id, message } = event;
      // Only page 1 (newest-first) ever needs a new message spliced in.
      queryClient.setQueriesData<PaginatedData<ChatMessage>>(
        {
          predicate: (query) =>
            query.queryKey[0] === "chat-messages" &&
            query.queryKey[1] === thread_id &&
            query.queryKey[2] === 1,
        },
        (old) => {
          if (!old) return old;
          if (old.items.some((item) => item.id === message.id)) return old;
          return { ...old, items: [message, ...old.items] };
        }
      );
      // Cheaper to refetch the (small) thread list than to replicate the
      // server's preview/unread-count logic client-side.
      queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
      break;
    }
    case "chat_message_translated": {
      const { thread_id, message_id, translated_body, translated_locale } = event;
      queryClient.setQueriesData<PaginatedData<ChatMessage>>(
        {
          predicate: (query) =>
            query.queryKey[0] === "chat-messages" && query.queryKey[1] === thread_id,
        },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === message_id ? { ...item, translated_body, translated_locale } : item
            ),
          };
        }
      );
      break;
    }
    case "notification": {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      break;
    }
  }
}

export function RealtimeProvider() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  // Stable for the app's lifetime (QueryProvider creates it once via a
  // useState lazy initializer), so including it below never causes an
  // extra reconnect.
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken) return;

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;
    let hasConnectedOnce = false;
    let stopped = false;

    function connect() {
      const url = getWebSocketUrl(accessToken!);
      if (!url) return;

      socket = new WebSocket(url);

      socket.onopen = () => {
        attempt = 0;
        if (hasConnectedOnce) {
          // Reconnecting after a drop — the socket is a live nudge, not a
          // delivery guarantee, so catch up by refetching rather than
          // assuming nothing happened while disconnected.
          queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
        hasConnectedOnce = true;
      };

      socket.onmessage = (event) => {
        let payload: RealtimeEvent;
        try {
          payload = JSON.parse(event.data);
        } catch {
          return;
        }
        handleRealtimeEvent(queryClient, payload);
      };

      socket.onclose = (event) => {
        if (stopped) return;
        if (event.code === AUTH_FAILURE_CLOSE_CODE) {
          // Wait for a fresh accessToken (next-auth refreshes it lazily on
          // the next session read) — that changes the effect's dependency
          // and reconnects with the new token.
          return;
        }
        attempt += 1;
        const delay = Math.min(BASE_BACKOFF_MS * 2 ** (attempt - 1), MAX_BACKOFF_MS);
        reconnectTimer = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        socket?.close();
      };
    }

    connect();

    return () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [accessToken, queryClient]);

  return null;
}
