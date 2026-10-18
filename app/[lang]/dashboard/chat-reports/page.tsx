import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import { ChatReportsPageClient } from "@/components/dashboard/chat-reports/chat-reports-page-client";
import type { ChatReportStatus } from "@/lib/api/types";
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
  const session = await getSession();
  if (!session?.accessToken || session.user.userType !== "ADMIN") {
    redirect(`/${locale}/login`);
  }

  const resolvedSearchParams = await searchParams;
  const status = resolveStatus(resolvedSearchParams.status);
  const page = resolvePage(resolvedSearchParams.page);
  const dict = await getDictionary(locale);

  return (
    <ChatReportsPageClient
      lang={locale}
      dict={dict.dashboard.chatReports}
      status={status}
      page={page}
    />
  );
}
