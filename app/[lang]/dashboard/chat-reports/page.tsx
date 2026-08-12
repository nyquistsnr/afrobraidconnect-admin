import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import { ChatReportsManager } from "@/components/dashboard/chat-reports/chat-reports-manager";
import { adminChatReportsApi } from "@/lib/api/admin-chat-reports-client";
import type {
  AdminChatReport,
  ChatReportStatus,
  PaginationMeta,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

export const metadata = { title: "Chat Reports - Admin" };

const reportStatuses: ChatReportStatus[] = [
  "OPEN",
  "UNDER_REVIEW",
  "RESOLVED",
  "DISMISSED",
];

function resolveStatus(value: string | string[] | undefined): ChatReportStatus {
  if (typeof value === "string") {
    const normalized = value.toUpperCase();
    if (reportStatuses.includes(normalized as ChatReportStatus)) {
      return normalized as ChatReportStatus;
    }
  }
  return "OPEN";
}

function resolvePage(value: string | string[] | undefined) {
  if (typeof value !== "string") return 1;
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function ChatReportsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const session = await auth();
  if (!session?.accessToken || session.user.userType !== "ADMIN") {
    redirect(`/${locale}/login`);
  }

  const resolvedSearchParams = await searchParams;
  const status = resolveStatus(resolvedSearchParams.status);
  const page = resolvePage(resolvedSearchParams.page);
  const dict = await getDictionary(locale);

  let reports: AdminChatReport[] = [];
  let pagination: PaginationMeta = {
    page,
    page_size: 20,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  };
  let initialLoadError = false;

  try {
    const response = await adminChatReportsApi.list(session.accessToken, locale, {
      status,
      page,
      page_size: 20,
    });
    reports = response.items;
    pagination = response.pagination;
  } catch (error) {
    initialLoadError = true;
    console.error("Failed to load chat reports:", error);
  }

  return (
    <ChatReportsManager
      key={`${status}-${page}`}
      accessToken={session.accessToken}
      lang={locale}
      dict={dict.dashboard.chatReports}
      initialReports={reports}
      initialPagination={pagination}
      status={status}
      page={page}
      initialLoadError={initialLoadError}
    />
  );
}
