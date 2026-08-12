import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasLocale } from "@/app/[lang]/dictionaries";
import { getAdminPaymentsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import { extractPagination } from "@/components/dashboard/admin-commerce/formatters";
import { AdminPaymentsManager } from "@/components/dashboard/payments/admin-payments-manager";
import { adminPaymentsApi } from "@/lib/api/admin-payments-client";
import type {
  AdminPaymentListItem,
  AdminPaymentsListParams,
  PaginationMeta,
  PaymentPurpose,
  PaymentStatus,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "en";
  return { title: `${getAdminPaymentsDict(locale).title} - Admin` };
}

const paymentPurposes: PaymentPurpose[] = ["FULL", "DEPOSIT", "BALANCE"];
const paymentStatuses: PaymentStatus[] = [
  "PENDING",
  "SUCCEEDED",
  "FAILED",
  "CANCELED",
  "PROCESSING",
  "REQUIRES_ACTION",
  "REFUNDED",
];

function stringParam(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function pageParam(value: string | string[] | undefined) {
  const parsed = Number.parseInt(stringParam(value) ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function boolParam(value: string | string[] | undefined) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function enumParam<T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[]
) {
  const normalized = stringParam(value)?.toUpperCase();
  return allowed.includes(normalized as T) ? (normalized as T) : undefined;
}


export default async function AdminPaymentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const dict = getAdminPaymentsDict(locale);
  const session = await auth();
  if (!session?.accessToken || session.user.userType !== "ADMIN") {
    redirect(`/${locale}/login`);
  }

  const resolvedSearchParams = await searchParams;
  const filters: AdminPaymentsListParams = {
    purpose: enumParam(resolvedSearchParams.purpose, paymentPurposes),
    status: enumParam(resolvedSearchParams.status, paymentStatuses),
    date_from: stringParam(resolvedSearchParams.date_from),
    date_to: stringParam(resolvedSearchParams.date_to),
    booking_date_from: stringParam(resolvedSearchParams.booking_date_from),
    booking_date_to: stringParam(resolvedSearchParams.booking_date_to),
    currency: stringParam(resolvedSearchParams.currency)?.toUpperCase(),
    is_refunded: boolParam(resolvedSearchParams.is_refunded),
    search: stringParam(resolvedSearchParams.search),
    page: pageParam(resolvedSearchParams.page),
    page_size: 20,
  };
  let payments: AdminPaymentListItem[] = [];
  let pagination: PaginationMeta = {
    page: filters.page ?? 1,
    page_size: 20,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  };
  let initialLoadError = false;

  try {
    const response = await adminPaymentsApi.list(
      session.accessToken,
      locale,
      filters
    );
    payments = Array.isArray(response.items) ? response.items : [];
    pagination = extractPagination(response, filters.page ?? 1, filters.page_size ?? 20, payments.length);
  } catch (error) {
    initialLoadError = true;
    console.warn(
      "Failed to load admin payments:",
      error instanceof Error ? error.message : error
    );
  }

  return (
    <AdminPaymentsManager
      key={JSON.stringify(filters)}
      lang={locale}
      dict={dict}
      payments={payments}
      pagination={pagination}
      filters={filters}
      initialLoadError={initialLoadError}
    />
  );
}
