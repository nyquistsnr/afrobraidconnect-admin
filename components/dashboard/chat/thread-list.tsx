"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Inbox, MessageSquare } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { PaginatedData, ChatThread } from "@/lib/api/types";
import { chatApi } from "@/lib/api/chat-client";
import { formatDate, formatTime } from "@/lib/format";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 20;

export function ThreadList({
  dict,
  lang,
  initialData,
}: {
  dict: Dictionary["chat"]["inbox"];
  lang: Locale;
  initialData: PaginatedData<ChatThread>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const [page, setPage] = useState(1);

  const threadsQuery = useQuery({
    queryKey: ["chat-threads", { page, page_size: PAGE_SIZE }],
    queryFn: () => chatApi.listThreads(accessToken!, lang, { page, page_size: PAGE_SIZE }),
    enabled: !!accessToken,
    initialData: page === 1 ? initialData : undefined,
    placeholderData: (previous) => previous,
  });

  const threads = threadsQuery.data?.items ?? [];
  const isLoading = threadsQuery.isLoading || threadsQuery.isPlaceholderData;

  if (threadsQuery.isError) {
    return (
      <div className="border border-border bg-surface px-4 py-12 text-center text-sm text-muted-foreground shadow-sm">
        {dict.loadError}
      </div>
    );
  }

  if (!isLoading && threads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 border border-border bg-surface px-4 py-16 text-center shadow-sm">
        <Inbox className="size-8 text-icon-muted" />
        <p className="text-sm font-semibold text-foreground">{dict.empty}</p>
        <p className="max-w-xs text-xs text-muted-foreground">{dict.emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="border border-border bg-surface shadow-sm">
      <ul className="divide-y divide-border">
        {threads.map((thread) => (
          <li key={thread.id}>
            <button
              type="button"
              onClick={() => router.push(`/${lang}/dashboard/chat/${thread.id}`)}
              className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-border/10"
            >
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <MessageSquare className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {thread.other_participant_name}
                  </p>
                  {thread.last_message_at && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(thread.last_message_at, lang)} ·{" "}
                      {formatTime(thread.last_message_at, lang)}
                    </span>
                  )}
                </div>
                <p
                  className={`mt-0.5 truncate text-xs ${
                    thread.last_message_flagged
                      ? "italic text-muted-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {thread.last_message_flagged
                    ? dict.flaggedPreview
                    : (thread.last_message_preview ?? "")}
                </p>
              </div>

              {thread.unread_count > 0 && (
                <span className="mt-0.5 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-semibold text-brand-foreground">
                  {thread.unread_count > 99 ? "99+" : thread.unread_count}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {threadsQuery.data && (
        <Pagination
          page={threadsQuery.data.pagination.page}
          totalPages={threadsQuery.data.pagination.total_pages}
          hasNext={threadsQuery.data.pagination.has_next}
          hasPrevious={threadsQuery.data.pagination.has_previous}
          onPageChange={setPage}
          disabled={isLoading}
          summary={dict.paginationSummary
            .replace("{page}", String(threadsQuery.data.pagination.page))
            .replace("{totalPages}", String(threadsQuery.data.pagination.total_pages))}
          previousLabel={dict.previous}
          nextLabel={dict.next}
        />
      )}
    </div>
  );
}
