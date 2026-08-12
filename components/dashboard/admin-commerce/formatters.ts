import type {
  AdminBookingDetail,
  AdminBookingListItem,
  AdminBookingPayment,
  Currency,
} from "@/lib/api/types";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

interface CommercePersonFields {
  customer_first_name?: string | null;
  customer_last_name?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  braider_first_name?: string | null;
  braider_last_name?: string | null;
  braider_business_name?: string | null;
  braider_name?: string | null;
  braider_email?: string | null;
}

export function compactDateTime(
  iso: string | null | undefined,
  lang: Locale
) {
  if (!iso) return "-";
  return `${formatDate(iso, lang)} ${formatTime(iso, lang)}`;
}

export function moneyFromMinor(
  amount: number | string | null | undefined,
  currency: Currency | null | undefined,
  lang: Locale
) {
  if (amount === null || amount === undefined || amount === "") return "-";
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return "-";
  return formatCurrency(numeric / 100, currency || "EUR", lang);
}

export function formatCount(value: number | null | undefined) {
  if (value === undefined || value === null) return "-";
  return new Intl.NumberFormat("en-US").format(value);
}

export function extractMoney(
  stats: Record<string, any> | null | undefined,
  keys: string[],
  currency: Currency | null | undefined,
  lang: Locale
) {
  if (!stats) return "-";
  for (const key of keys) {
    const val = stats[key];
    if (val !== null && val !== undefined && val !== "") {
      const numeric = Number(val);
      if (!Number.isFinite(numeric)) continue;
      if (key.endsWith("_minor")) {
        return formatCurrency(numeric / 100, currency || "EUR", lang);
      }
      return formatCurrency(numeric, currency || "EUR", lang);
    }
  }
  return "-";
}

export function extractCount(
  stats: Record<string, any> | null | undefined,
  keys: string[]
) {
  if (!stats) return "-";
  for (const key of keys) {
    const val = stats[key];
    if (val !== null && val !== undefined && val !== "") {
      return formatCount(val);
    }
  }
  return "-";
}

export function bookingReference(
  booking: Pick<AdminBookingListItem, "id" | "reference" | "booking_reference">
) {
  return booking.reference || booking.booking_reference || booking.id;
}

export function customerName(record: CommercePersonFields) {
  const composed = [record.customer_first_name, record.customer_last_name]
    .filter(Boolean)
    .join(" ");
  return record.customer_name || composed || record.customer_email || "-";
}

export function braiderName(record: CommercePersonFields) {
  const composed = [record.braider_first_name, record.braider_last_name]
    .filter(Boolean)
    .join(" ");
  return (
    record.braider_business_name ||
    record.braider_name ||
    composed ||
    record.braider_email ||
    "-"
  );
}

export function bookingTotalMinor(
  booking: Partial<AdminBookingListItem | AdminBookingDetail> & Record<string, any>
) {
  const minor =
    booking.total_amount_minor ??
    booking.total_minor ??
    booking.amount_total_minor;
  if (minor !== null && minor !== undefined && minor !== "") {
    return Number(minor);
  }

  const major = booking.total ?? booking.total_amount ?? booking.amount_total;
  if (major !== null && major !== undefined && major !== "") {
    const num = Number(major);
    if (Number.isFinite(num)) return num * 100;
  }
  return null;
}

export function paymentAmountMinor(payment: Partial<AdminBookingPayment> & Record<string, any>) {
  if (payment.amount_minor !== null && payment.amount_minor !== undefined && payment.amount_minor !== "") {
    return Number(payment.amount_minor);
  }
  if (payment.amount !== null && payment.amount !== undefined && payment.amount !== "") {
    const num = Number(payment.amount);
    if (Number.isFinite(num)) return num * 100;
  }
  return null;
}

export function refundedMinor(payment: Partial<AdminBookingPayment> & Record<string, any>) {
  if (payment.amount_refunded_minor !== null && payment.amount_refunded_minor !== undefined && payment.amount_refunded_minor !== "") {
    return Number(payment.amount_refunded_minor);
  }
  if (payment.amount_refunded !== null && payment.amount_refunded !== undefined && payment.amount_refunded !== "") {
    const num = Number(payment.amount_refunded);
    if (Number.isFinite(num)) return num * 100;
  }
  return null;
}

export function extractPagination(
  response: any,
  fallbackPage: number,
  fallbackPageSize: number,
  fallbackItemsLength: number
): {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
} {
  if (response.pagination) return response.pagination;
  return {
    page: response.page ?? fallbackPage,
    page_size: response.page_size ?? fallbackPageSize,
    total_items: response.total_items ?? fallbackItemsLength,
    total_pages: response.total_pages ?? (fallbackItemsLength > 0 ? 1 : 0),
    has_next: response.has_next ?? false,
    has_previous: response.has_previous ?? false,
  };
}
