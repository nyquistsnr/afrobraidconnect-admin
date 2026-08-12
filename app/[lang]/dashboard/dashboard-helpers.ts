import type {
  AdminDashboardChartParams,
  AdminDashboardFilters,
  AdminRevenueChartInterval,
  BookingStatus,
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

export function parseAdminDashboardFilters(searchParams: {
  [key: string]: string | string[] | undefined;
}): AdminDashboardFilters {
  return {
    date_from: stringParam(searchParams.date_from),
    date_to: stringParam(searchParams.date_to),
    created_from: stringParam(searchParams.created_from),
    created_to: stringParam(searchParams.created_to),
    payment_date_from: stringParam(searchParams.payment_date_from),
    payment_date_to: stringParam(searchParams.payment_date_to),
    country: stringParam(searchParams.country)?.toUpperCase(),
    currency: stringParam(searchParams.currency)?.toUpperCase(),
    is_mobile: boolParam(searchParams.is_mobile),
    payment_schedule: enumParam(searchParams.payment_schedule, paymentSchedules),
    search: stringParam(searchParams.search),
    status: enumParam(searchParams.status, bookingStatuses),
  };
}

export function parseAdminDashboardChartParams(
  searchParams: { [key: string]: string | string[] | undefined },
  filters: AdminDashboardFilters
): AdminDashboardChartParams {
  const interval = stringParam(searchParams.interval);
  const limit = Number.parseInt(stringParam(searchParams.limit) ?? "", 10);

  return {
    date_from: filters.date_from,
    date_to: filters.date_to,
    country: filters.country,
    currency: filters.currency,
    is_mobile: filters.is_mobile,
    payment_schedule: filters.payment_schedule,
    search: filters.search,
    interval:
      interval === "day" || interval === "week" || interval === "month"
        ? (interval as AdminRevenueChartInterval)
        : "month",
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 25) : 8,
  };
}
