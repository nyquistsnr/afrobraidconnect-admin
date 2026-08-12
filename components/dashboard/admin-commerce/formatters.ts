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
  booking: Partial<AdminBookingListItem | AdminBookingDetail>
) {
  return (
    booking.total_amount_minor ??
    booking.total_minor ??
    booking.amount_total_minor ??
    null
  );
}

export function paymentAmountMinor(payment: Partial<AdminBookingPayment>) {
  return payment.amount_minor ?? null;
}

export function refundedMinor(payment: Partial<AdminBookingPayment>) {
  return payment.amount_refunded_minor ?? null;
}
