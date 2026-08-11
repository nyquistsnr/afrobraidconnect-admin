"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AlertTriangle, ArrowLeft, Flag, Send } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { ChatMessage, PaginatedData } from "@/lib/api/types";
import { chatApi } from "@/lib/api/chat-client";
import { getAuthErrorMessage } from "@/lib/api/error-messages";
import { formatDate, formatTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ReportThreadModal } from "@/components/dashboard/chat/report-thread-modal";

const PAGE_SIZE = 20;
const MAX_MESSAGE_LENGTH = 2000;

function MessageBubble({
  message,
  isMine,
  lang,
  viewerChatLocale,
  dict,
  showOriginal,
  onToggleOriginal,
}: {
  message: ChatMessage;
  isMine: boolean;
  lang: Locale;
  viewerChatLocale: string | null;
  dict: Dictionary["chat"]["thread"];
  showOriginal: boolean;
  onToggleOriginal: () => void;
}) {
  const canShowTranslation =
    message.status === "SENT" &&
    !!message.translated_body &&
    message.body !== message.translated_body;

  const displayBody =
    canShowTranslation && !showOriginal ? message.translated_body : message.body;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] sm:max-w-[65%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`px-4 py-2.5 text-sm shadow-sm rounded-2xl ${
            message.status === "FLAGGED"
              ? "border border-dashed border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400"
              : isMine
                ? "bg-brand text-brand-foreground rounded-br-sm"
                : "border border-border bg-surface text-foreground rounded-bl-sm"
          }`}
        >
          {message.status === "FLAGGED" ? (
            <span className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{message.violation_notice}</span>
            </span>
          ) : (
            <span className="whitespace-pre-wrap break-words">{displayBody}</span>
          )}
        </div>

        {canShowTranslation && (
          <button
            type="button"
            onClick={onToggleOriginal}
            className="mt-1 text-[11px] text-muted-foreground underline-offset-2 hover:underline"
          >
            {!showOriginal && message.body_locale
              ? dict.translatedFrom.replace("{locale}", message.body_locale.toUpperCase())
              : ""}
            {showOriginal ? dict.seeTranslation : dict.seeOriginal}
          </button>
        )}

        <span className="mt-1 text-[11px] text-muted-foreground">
          {formatDate(message.created_at, lang)} · {formatTime(message.created_at, lang)}
        </span>
      </div>
    </div>
  );
}

export function ThreadView({
  threadId,
  otherParticipantName,
  initialData,
  lang,
  dict,
  common,
  currentUserId,
  currentChatLocale,
}: {
  threadId: string;
  otherParticipantName: string | null;
  initialData: PaginatedData<ChatMessage>;
  lang: Locale;
  dict: Dictionary["chat"];
  common: Dictionary["common"];
  currentUserId: string;
  currentChatLocale: string | null;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const queryClient = useQueryClient();

  const [olderMessages, setOlderMessages] = useState<ChatMessage[]>([]);
  const [nextOlderPage, setNextOlderPage] = useState(2);
  const [hasMoreOlder, setHasMoreOlder] = useState(initialData.pagination.has_next);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [draft, setDraft] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [originalShownFor, setOriginalShownFor] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useQuery({
    queryKey: ["chat-messages", threadId, 1],
    queryFn: () => chatApi.listMessages(accessToken!, threadId, lang, { page: 1, page_size: PAGE_SIZE }),
    enabled: !!accessToken,
    initialData,
  });

  const newestFirst = messagesQuery.data?.items ?? initialData.items;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [newestFirst[0]?.id]);

  useEffect(() => {
    if (!accessToken) return;
    chatApi.markRead(accessToken, threadId, lang).then(() => {
      queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
    });
    // Only ever needs to run once per thread visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, accessToken]);

  async function handleLoadEarlier() {
    if (!accessToken || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const res = await chatApi.listMessages(accessToken, threadId, lang, {
        page: nextOlderPage,
        page_size: PAGE_SIZE,
      });
      setOlderMessages((prev) => [...[...res.items].reverse(), ...prev]);
      setHasMoreOlder(res.pagination.has_next);
      setNextOlderPage((p) => p + 1);
    } catch {
      toast.error(dict.thread.loadError);
    } finally {
      setLoadingOlder(false);
    }
  }

  const sendMutation = useMutation({
    mutationFn: (body: string) => chatApi.sendMessage(accessToken!, threadId, body, lang),
    onSuccess: (message) => {
      queryClient.setQueryData<PaginatedData<ChatMessage>>(
        ["chat-messages", threadId, 1],
        (old) => {
          if (!old) return old;
          if (old.items.some((item) => item.id === message.id)) return old;
          return { ...old, items: [message, ...old.items] };
        }
      );
      queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
      setDraft("");
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error.message, common.errors));
    },
  });

  function submitDraft() {
    const trimmed = draft.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  }

  function handleSend(event: React.FormEvent) {
    event.preventDefault();
    submitDraft();
  }

  function toggleOriginal(messageId: string) {
    setOriginalShownFor((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
  }

  const timeline = [...olderMessages, ...[...newestFirst].reverse()];

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => router.push(`/${lang}/dashboard/chat`)}
            aria-label={dict.thread.backToInbox}
            className="p-1.5 text-muted-foreground transition-colors hover:bg-border/40 hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </button>
          <p className="truncate text-sm font-semibold text-foreground">
            {otherParticipantName ?? dict.title}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-border/40 hover:text-foreground"
        >
          <Flag className="size-3.5" />
          {dict.thread.reportAction}
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {hasMoreOlder && (
          <div className="flex justify-center pb-2">
            <Button
              type="button"
              variant="outline"
              className="w-auto"
              disabled={loadingOlder}
              onClick={handleLoadEarlier}
            >
              {loadingOlder ? common.loading : dict.thread.loadEarlier}
            </Button>
          </div>
        )}

        {messagesQuery.isError && timeline.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">{dict.thread.loadError}</p>
        ) : (
          timeline.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isMine={message.sender_id === currentUserId}
              lang={lang}
              viewerChatLocale={currentChatLocale}
              dict={dict.thread}
              showOriginal={originalShownFor.has(message.id)}
              onToggleOriginal={() => toggleOriginal(message.id)}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-border bg-surface p-3 sm:p-4">
        <div className="flex items-end gap-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            placeholder={dict.thread.composerPlaceholder}
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            className="max-h-32 min-h-[44px] min-w-0 flex-1 resize-none rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-brand"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submitDraft();
              }
            }}
          />
          <Button
            type="submit"
            className="!h-11 !w-11 shrink-0 !rounded-full !p-0"
            disabled={!draft.trim() || sendMutation.isPending}
          >
            <Send className="size-5" />
          </Button>
        </div>
        <p className="mt-2 text-right text-[11px] text-muted-foreground">
          {dict.thread.charLimit.replace("{count}", String(draft.length))}
        </p>
      </form>

      {accessToken && (
        <ReportThreadModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          threadId={threadId}
          accessToken={accessToken}
          lang={lang}
          dict={dict.report}
          common={common}
        />
      )}
    </div>
  );
}
