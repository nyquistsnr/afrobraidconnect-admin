import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import { ReviewsManager } from "@/components/dashboard/reviews/reviews-manager";
import type { ReviewStatus } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

export const metadata = { title: "Reviews - Admin" };

const reviewStatuses: ReviewStatus[] = ["PENDING", "APPROVED", "REJECTED"];

function resolveStatus(value: string | string[] | undefined): ReviewStatus {
  if (typeof value === "string") {
    const normalized = value.toUpperCase();
    if (reviewStatuses.includes(normalized as ReviewStatus)) {
      return normalized as ReviewStatus;
    }
  }
  return "PENDING";
}

function resolvePage(value: string | string[] | undefined) {
  if (typeof value !== "string") return 1;
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function ReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const resolvedSearchParams = await searchParams;
  const status = resolveStatus(resolvedSearchParams.status);
  const page = resolvePage(resolvedSearchParams.page);
  const dict = await getDictionary(locale);

  return (
    <ReviewsManager
      key={`${status}-${page}`}
      lang={locale}
      dict={dict.dashboard.reviews}
      status={status}
      page={page}
    />
  );
}
