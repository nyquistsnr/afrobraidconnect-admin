import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasLocale } from "@/app/[lang]/dictionaries";
import { getAdminBookingsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import { AdminBookingsManager } from "@/components/dashboard/bookings/admin-bookings-manager";
import { adminBookingsApi } from "@/lib/api/admin-bookings-client";
import type {
  AdminBookingListItem,
  AdminBookingsListParams,
  BookingStatus,
  PaginationMeta,
  PaymentSchedule,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "en";
  return { title: `${getAdminBookingsDict(locale).title} - Admin` };
}

const bookingStatuses: BookingStatus[] = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED_BY_CUSTOMER",
  "CANCELLED_BY_BRAIDER",
  "CANCELLED_NO_PAYMENT",
  "EXPIRED",
  "DISPUTED",
];

const paymentSchedules: PaymentSchedule[] = [
  "FULL_UPFRONT",
  "DEPOSIT_THEN_BALANCE",
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

function fallbackPagination(
  page: number,
  pageSize: number,
  itemCount: number
): PaginationMeta {
  return {
    page,
    page_size: pageSize,
    total_items: itemCount,
    total_pages: itemCount > 0 ? 1 : 0,
    has_next: false,
    has_previous: false,
  };
}

export default async function AdminBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const dict = getAdminBookingsDict(locale);
  const session = await auth();
  if (!session?.accessToken || session.user.userType !== "ADMIN") {
    redirect(`/${locale}/login`);
  }

  const resolvedSearchParams = await searchParams;
  const filters: AdminBookingsListParams = {
    status: enumParam(resolvedSearchParams.status, bookingStatuses),
    date_from: stringParam(resolvedSearchParams.date_from),
    date_to: stringParam(resolvedSearchParams.date_to),
    created_from: stringParam(resolvedSearchParams.created_from),
    created_to: stringParam(resolvedSearchParams.created_to),
    country: stringParam(resolvedSearchParams.country)?.toUpperCase(),
    currency: stringParam(resolvedSearchParams.currency)?.toUpperCase(),
    is_mobile: boolParam(resolvedSearchParams.is_mobile),
    payment_schedule: enumParam(
      resolvedSearchParams.payment_schedule,
      paymentSchedules
    ),
    search: stringParam(resolvedSearchParams.search),
    page: pageParam(resolvedSearchParams.page),
    page_size: 20,
  };
  let bookings: AdminBookingListItem[] = [];
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
    const response = await adminBookingsApi.list(
      session.accessToken,
      locale,
      filters
    );
    bookings = Array.isArray(response.items) ? response.items : [];
    pagination =
      response.pagination ??
      fallbackPagination(filters.page ?? 1, filters.page_size ?? 20, bookings.length);
  } catch (error) {
    initialLoadError = true;
    console.warn(
      "Failed to load admin bookings:",
      error instanceof Error ? error.message : error
    );
  }

  return (
    <AdminBookingsManager
      key={JSON.stringify(filters)}
      lang={locale}
      dict={dict}
      bookings={bookings}
      pagination={pagination}
      filters={filters}
      initialLoadError={initialLoadError}
    />
  );
}
