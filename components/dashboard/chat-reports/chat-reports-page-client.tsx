"use client";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { ChatReportsManager } from "@/components/dashboard/chat-reports/chat-reports-manager";
import { DashboardPageSkeleton } from "@/components/dashboard/shared/dashboard-page-skeleton";
import { adminChatReportsApi } from "@/lib/api/admin-chat-reports-client";
import type { ChatReportStatus, PaginationMeta } from "@/lib/api/types";
import { useAccessToken } from "@/lib/access-token";
import type { Locale } from "@/lib/i18n";
import { adminKeys } from "@/lib/query-keys";
import { useAdminQuery } from "@/lib/use-admin-query";

const PAGE_SIZE = 20;

export function ChatReportsPageClient({
  lang,
  dict,
  status,
  page,
}: {
  lang: Locale;
  dict: Dictionary["dashboard"]["chatReports"];
  status: ChatReportStatus;
  page: number;
}) {
  const accessToken = useAccessToken();
  const query = useAdminQuery([...adminKeys.chatReports, lang, status, page], (token) =>
    adminChatReportsApi.list(token, lang, { status, page, page_size: PAGE_SIZE })
  );
  if (query.isPending) return <DashboardPageSkeleton />;

  const pagination: PaginationMeta = query.data?.pagination ?? {
    page,
    page_size: PAGE_SIZE,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  };

  return (
    <ChatReportsManager
      key={`${status}-${page}-${query.dataUpdatedAt}`}
      accessToken={accessToken ?? ""}
      lang={lang}
      dict={dict}
      initialReports={query.data?.items ?? []}
      initialPagination={pagination}
      status={status}
      page={page}
      initialLoadError={query.isError}
    />
  );
}
