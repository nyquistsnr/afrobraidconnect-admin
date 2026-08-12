import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import { ContactSubmissionsManager } from "@/components/dashboard/contact-submissions/contact-submissions-manager";
import { adminContactSubmissionsApi } from "@/lib/api/admin-contact-submissions-client";
import type {
  AdminContactSubmission,
  AdminContactSubmissionsListParams,
  ContactSubmissionPlatform,
  ContactSubmissionPurpose,
  PaginationMeta,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

export const metadata = { title: "Contact Submissions - Admin" };

const platforms: ContactSubmissionPlatform[] = ["CUSTOMER", "BRAIDER"];
const purposes: ContactSubmissionPurpose[] = [
  "GENERAL",
  "PARTNER",
  "PRICING",
  "FAQS",
];

function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function enumParam<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[]
) {
  const normalized = stringParam(value)?.toUpperCase();
  return allowed.includes(normalized as T) ? (normalized as T) : undefined;
}

function boolParam(value: string | string[] | undefined) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function pageParam(value: string | string[] | undefined) {
  const parsed = Number.parseInt(stringParam(value) ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function parseFilters(searchParams: {
  [key: string]: string | string[] | undefined;
}): AdminContactSubmissionsListParams {
  return {
    platform: enumParam(searchParams.platform, platforms),
    purpose: enumParam(searchParams.purpose, purposes),
    is_read: boolParam(searchParams.is_read),
    date_from: stringParam(searchParams.date_from),
    date_to: stringParam(searchParams.date_to),
    search: stringParam(searchParams.search),
    page: pageParam(searchParams.page),
    page_size: 20,
  };
}

export default async function ContactSubmissionsPage({
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
  const filters = parseFilters(resolvedSearchParams);
  const dict = await getDictionary(locale);
  let submissions: AdminContactSubmission[] = [];
  let pagination: PaginationMeta = {
    page: filters.page ?? 1,
    page_size: filters.page_size ?? 20,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  };
  let initialLoadError = false;

  try {
    const response = await adminContactSubmissionsApi.list(
      session.accessToken,
      locale,
      filters
    );
    submissions = Array.isArray(response.items) ? response.items : [];
    pagination = response.pagination ?? pagination;
  } catch (error) {
    initialLoadError = true;
    console.warn(
      "Failed to load admin contact submissions:",
      error instanceof Error ? error.message : error
    );
  }

  return (
    <ContactSubmissionsManager
      key={`${filters.platform ?? "all"}-${filters.purpose ?? "all"}-${
        filters.is_read ?? "all"
      }-${filters.date_from ?? ""}-${filters.date_to ?? ""}-${
        filters.search ?? ""
      }-${filters.page ?? 1}`}
      accessToken={session.accessToken}
      lang={locale}
      dict={dict.dashboard.contactSubmissions}
      submissions={submissions}
      pagination={pagination}
      filters={filters}
      initialLoadError={initialLoadError}
    />
  );
}
