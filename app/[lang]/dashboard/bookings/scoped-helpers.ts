import type {
  AdminBookingStatsParams,
  AdminBookingsListParams,
  BookingStatus,
  PaginationMeta,
  PaymentSchedule,
} from "@/lib/api/types";

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

export function parseScopedBookingListParams(searchParams: {
  [key: string]: string | string[] | undefined;
}): AdminBookingsListParams {
  return {
    status: enumParam(searchParams.status, bookingStatuses),
    date_from: stringParam(searchParams.date_from),
    date_to: stringParam(searchParams.date_to),
    created_from: stringParam(searchParams.created_from),
    created_to: stringParam(searchParams.created_to),
    country: stringParam(searchParams.country)?.toUpperCase(),
    currency: stringParam(searchParams.currency)?.toUpperCase(),
    is_mobile: boolParam(searchParams.is_mobile),
    payment_schedule: enumParam(searchParams.payment_schedule, paymentSchedules),
    search: stringParam(searchParams.search),
    page: pageParam(searchParams.page),
    page_size: 20,
  };
}

export function statsParamsFromListParams(
  searchParams: { [key: string]: string | string[] | undefined },
  listParams: AdminBookingsListParams
): AdminBookingStatsParams {
  return {
    status: listParams.status,
    date_from: listParams.date_from,
    date_to: listParams.date_to,
    created_from: listParams.created_from,
    created_to: listParams.created_to,
    payment_date_from: stringParam(searchParams.payment_date_from),
    payment_date_to: stringParam(searchParams.payment_date_to),
    country: listParams.country,
    currency: listParams.currency,
    is_mobile: listParams.is_mobile,
    payment_schedule: listParams.payment_schedule,
    search: listParams.search,
  };
}

export function fallbackPagination(
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
