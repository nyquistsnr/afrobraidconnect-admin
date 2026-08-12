import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import { ReviewsManager } from "@/components/dashboard/reviews/reviews-manager";
import { adminReviewsApi } from "@/lib/api/admin-reviews-client";
import type { AdminReview, PaginationMeta, ReviewStatus } from "@/lib/api/types";
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
  const session = await auth();
  if (!session?.accessToken || session.user.userType !== "ADMIN") {
    redirect(`/${locale}/login`);
  }

  const resolvedSearchParams = await searchParams;
  const status = resolveStatus(resolvedSearchParams.status);
  const page = resolvePage(resolvedSearchParams.page);
  const dict = await getDictionary(locale);

  let reviews: AdminReview[] = [];
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
    const response = await adminReviewsApi.list(session.accessToken, locale, {
      status,
      page,
      page_size: 20,
    });
    reviews = response.items;
    pagination = response.pagination;
  } catch (error) {
    initialLoadError = true;
    console.error("Failed to load reviews:", error);
  }

  return (
    <ReviewsManager
      key={`${status}-${page}`}
      accessToken={session.accessToken}
      lang={locale}
      dict={dict.dashboard.reviews}
      initialReviews={reviews}
      initialPagination={pagination}
      status={status}
      page={page}
      initialLoadError={initialLoadError}
    />
  );
}
