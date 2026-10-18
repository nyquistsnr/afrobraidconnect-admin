import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDictionary, hasLocale } from "@/app/[lang]/dictionaries";
import { ContactSubmissionsPageClient } from "@/components/dashboard/contact-submissions/contact-submissions-page-client";
import type {
  AdminContactSubmissionsListParams,
  ContactSubmissionPlatform,
  ContactSubmissionPurpose,
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
  const session = await getSession();
  if (!session?.accessToken || session.user.userType !== "ADMIN") {
    redirect(`/${locale}/login`);
  }

  const resolvedSearchParams = await searchParams;
  const filters = parseFilters(resolvedSearchParams);
  const dict = await getDictionary(locale);
  return (
    <ContactSubmissionsPageClient
      lang={locale}
      dict={dict.dashboard.contactSubmissions}
      filters={filters}
    />
  );
}
