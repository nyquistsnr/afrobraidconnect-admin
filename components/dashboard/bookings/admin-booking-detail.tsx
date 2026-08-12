import Link from "next/link";
import { ArrowLeft, CalendarClock, CreditCard, MapPin, ReceiptText, UserRound } from "lucide-react";
import type { AdminBookingsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import {
  bookingReference,
  bookingTotalMinor,
  braiderName,
  compactDateTime,
  customerName,
  moneyFromMinor,
  extractMoney,
} from "@/components/dashboard/admin-commerce/formatters";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import type {
  AdminBookingDetail as AdminBookingDetailType,
  AdminBookingPayment,
  BookingStatus,
  PaymentPurpose,
  PaymentSchedule,
  PaymentStatus,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

type BookingsDict = AdminBookingsDict;

const statusTone: Partial<Record<BookingStatus, BadgeTone>> = {
  PENDING_PAYMENT: "warning",
  CONFIRMED: "info",
  IN_PROGRESS: "brand",
  COMPLETED: "success",
  NO_SHOW: "danger",
  CANCELLED_BY_CUSTOMER: "neutral",
  CANCELLED_BY_BRAIDER: "neutral",
  CANCELLED_NO_PAYMENT: "neutral",
  EXPIRED: "neutral",
  DISPUTED: "danger",
};

const paymentStatusTone: Partial<Record<PaymentStatus, BadgeTone>> = {
  PENDING: "warning",
  SUCCEEDED: "success",
  FAILED: "danger",
  CANCELED: "neutral",
  PROCESSING: "info",
  REQUIRES_ACTION: "warning",
  REFUNDED: "neutral",
};

export function AdminBookingDetail({
  booking,
  lang,
  dict,
}: {
  booking: AdminBookingDetailType;
  lang: Locale;
  dict: BookingsDict;
}) {
  const items = booking.booking_items ?? booking.items ?? [];
  const payments = booking.payments ?? [];
  const address = [
    booking.address_line1,
    booking.address_line2,
    booking.city,
    booking.postal_code,
    booking.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <Link
        href={`/${lang}/dashboard/bookings`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {dict.detail.back}
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-brand">{dict.detail.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {bookingReference(booking)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {booking.style_name || dict.table.noStyle}
          </p>
        </div>
        <Badge tone={statusTone[booking.status] ?? "neutral"} dot={false}>
          {dict.statusLabels[booking.status] ?? booking.status}
        </Badge>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel icon={UserRound} title={dict.detail.peopleTitle}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label={dict.detail.customer} value={customerName(booking)} />
            <Detail label={dict.detail.customerEmail} value={booking.customer_email || "-"} />
            <Detail label={dict.detail.customerId} value={booking.customer_id || "-"} mono />
            <Detail label={dict.detail.braider} value={braiderName(booking)} />
            <Detail label={dict.detail.braiderEmail} value={booking.braider_email || "-"} />
            <Detail label={dict.detail.braiderId} value={booking.braider_id || "-"} mono />
          </div>
        </Panel>

        <Panel icon={CalendarClock} title={dict.detail.scheduleTitle}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label={dict.detail.startsAt} value={compactDateTime(booking.starts_at, lang)} />
            <Detail label={dict.detail.endsAt} value={compactDateTime(booking.ends_at, lang)} />
            <Detail label={dict.detail.duration} value={booking.duration_minutes ? dict.detail.durationMinutes.replace("{minutes}", String(booking.duration_minutes)) : "-"} />
            <Detail label={dict.detail.timezone} value={booking.timezone || "-"} />
            <Detail label={dict.detail.serviceType} value={booking.is_mobile ? dict.table.mobile : dict.table.studio} />
            <Detail
              label={dict.detail.paymentSchedule}
              value={
                booking.payment_schedule
                  ? dict.paymentScheduleLabels[booking.payment_schedule as PaymentSchedule]
                  : "-"
              }
            />
          </div>
        </Panel>
      </section>

      <Panel icon={MapPin} title={dict.detail.addressTitle}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Detail label={dict.detail.address} value={address || "-"} />
          <Detail label={dict.detail.coordinates} value={coordinates(booking)} />
          <Detail label={dict.detail.cancellationCutoff} value={compactDateTime(booking.cancellation_cutoff_at, lang)} />
        </div>
      </Panel>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel icon={ReceiptText} title={dict.detail.priceTitle}>
          <dl className="divide-y divide-border">
            <MoneyRow label={dict.detail.serviceSubtotal} value={extractMoney(booking, ["service_subtotal_minor", "service_subtotal"], booking.currency, lang)} strong={false} />
            <MoneyRow label={dict.detail.travelFee} value={extractMoney(booking, ["travel_fee_minor", "travel_fee"], booking.currency, lang)} strong={false} />
            <MoneyRow label={dict.detail.subtotal} value={extractMoney(booking, ["subtotal_minor", "subtotal"], booking.currency, lang)} strong={false} />
            <MoneyRow label={dict.detail.platformFee} value={extractMoney(booking, ["platform_fee_minor", "platform_fee"], booking.currency, lang)} strong={false} />
            <MoneyRow label={dict.detail.vatOnService} value={extractMoney(booking, ["vat_service_minor", "vat_service", "vat_on_service"], booking.currency, lang)} strong={false} />
            <MoneyRow label={dict.detail.vatOnPlatformFee} value={extractMoney(booking, ["vat_platform_fee_minor", "vat_platform_fee", "vat_on_platform_fee"], booking.currency, lang)} strong={false} />
            <MoneyRow label={dict.detail.vatTotal} value={extractMoney(booking, ["vat_total_minor", "vat_total"], booking.currency, lang)} strong={false} />
            <MoneyRow label={dict.detail.depositAmount} value={extractMoney(booking, ["deposit_amount_minor", "deposit_amount"], booking.currency, lang)} strong={false} />
            <MoneyRow label={dict.detail.balanceAmount} value={extractMoney(booking, ["balance_amount_minor", "balance_amount"], booking.currency, lang)} strong={false} />
            <MoneyRow label={dict.detail.total} value={moneyFromMinor(bookingTotalMinor(booking), booking.currency, lang)} strong />
          </dl>
        </Panel>

        <Panel icon={CalendarClock} title={dict.detail.lifecycleTitle}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label={dict.detail.createdAt} value={compactDateTime(booking.created_at, lang)} />
            <Detail label={dict.detail.confirmedAt} value={compactDateTime(booking.confirmed_at, lang)} />
            <Detail label={dict.detail.completedAt} value={compactDateTime(booking.completed_at, lang)} />
            <Detail label={dict.detail.cancelledAt} value={compactDateTime(booking.cancelled_at, lang)} />
            <Detail label={dict.detail.expiredAt} value={compactDateTime(booking.expired_at, lang)} />
            <Detail label={dict.detail.updatedAt} value={compactDateTime(booking.updated_at, lang)} />
          </div>
        </Panel>
      </section>

      <Panel icon={ReceiptText} title={dict.detail.itemsTitle}>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{dict.detail.noItems}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-border/20">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dict.detail.itemType}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dict.detail.itemName}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dict.detail.quantity}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dict.detail.amount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item, index) => (
                  <tr key={item.id || `${item.type || "item"}-${item.label || item.name || index}-${index}`}>
                    <td className="px-4 py-3 text-foreground">{item.type || "-"}</td>
                    <td className="px-4 py-3 text-foreground">{item.label || item.name || "-"}</td>
                    <td className="px-4 py-3 text-right text-foreground">{item.quantity ?? "-"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {extractMoney(item, ["total_amount_minor", "amount_minor", "line_amount", "amount", "total_amount"], item.currency || booking.currency, lang)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel icon={CreditCard} title={dict.detail.paymentsTitle}>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">{dict.detail.noPayments}</p>
        ) : (
          <div>
            <div className="grid gap-3 md:hidden">
              {payments.map((payment, index) => (
                <PaymentCard
                  key={paymentKey(payment, index)}
                  payment={payment}
                  bookingCurrency={booking.currency}
                  lang={lang}
                  dict={dict}
                />
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-border/20">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dict.detail.paymentCreated}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dict.detail.paymentPurpose}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dict.detail.paymentStatus}</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dict.detail.amount}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dict.detail.stripeIds}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dict.detail.failure}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((payment, index) => (
                    <tr key={paymentKey(payment, index)}>
                      <td className="px-4 py-3 text-foreground">{compactDateTime(payment.created_at, lang)}</td>
                      <td className="px-4 py-3 text-foreground">
                        {paymentPurposeLabel(payment, dict)}
                      </td>
                      <td className="px-4 py-3">
                        <PaymentStatusBadge payment={payment} dict={dict} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-semibold text-foreground">
                          {extractMoney(payment, ["amount_minor", "amount"], payment.currency || booking.currency, lang)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {dict.detail.refunded}: {extractMoney(payment, ["amount_refunded_minor", "amount_refunded"], payment.currency || booking.currency, lang)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StripeIds payment={payment} />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {paymentFailure(payment)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}

function Panel({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-border bg-surface shadow-sm">
      <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-5">
        <div className="bg-brand/10 p-2 text-brand">
          <Icon className="size-5" />
        </div>
        <h2 className="text-base font-bold text-foreground">{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 break-all text-sm text-foreground ${
          mono ? "font-mono" : "font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MoneyRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={`text-sm text-foreground ${strong ? "font-bold" : "font-semibold"}`}>
        {value}
      </dd>
    </div>
  );
}

function PaymentCard({
  payment,
  bookingCurrency,
  lang,
  dict,
}: {
  payment: AdminBookingPayment;
  bookingCurrency: string;
  lang: Locale;
  dict: BookingsDict;
}) {
  return (
    <article className="border border-border bg-border/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <PaymentStatusBadge payment={payment} dict={dict} />
          <p className="text-xs font-medium text-muted-foreground">
            {compactDateTime(payment.created_at, lang)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-base font-bold text-foreground">
            {extractMoney(payment, ["amount_minor", "amount"], payment.currency || bookingCurrency, lang)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {paymentPurposeLabel(payment, dict)}
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-3 border-t border-border pt-4">
        <MobileDetail
          label={dict.detail.refunded}
          value={extractMoney(payment, ["amount_refunded_minor", "amount_refunded"], payment.currency || bookingCurrency, lang)}
        />
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {dict.detail.stripeIds}
          </dt>
          <dd className="mt-1">
            <StripeIds payment={payment} />
          </dd>
        </div>
        <MobileDetail label={dict.detail.failure} value={paymentFailure(payment)} />
      </dl>
    </article>
  );
}

function PaymentStatusBadge({
  payment,
  dict,
}: {
  payment: AdminBookingPayment;
  dict: BookingsDict;
}) {
  return (
    <Badge tone={paymentStatusTone[payment.status as PaymentStatus] ?? "neutral"} dot={false}>
      {payment.status && dict.paymentStatusLabels[payment.status as PaymentStatus]
        ? dict.paymentStatusLabels[payment.status as PaymentStatus]
        : payment.status || "-"}
    </Badge>
  );
}

function StripeIds({ payment }: { payment: AdminBookingPayment }) {
  return (
    <div className="space-y-1 font-mono text-xs text-muted-foreground">
      <p className="break-all">{payment.stripe_payment_intent_id || "-"}</p>
      <p className="break-all">{payment.stripe_charge_id || "-"}</p>
    </div>
  );
}

function paymentPurposeLabel(payment: AdminBookingPayment, dict: BookingsDict) {
  return payment.purpose && dict.paymentPurposeLabels[payment.purpose as PaymentPurpose]
    ? dict.paymentPurposeLabels[payment.purpose as PaymentPurpose]
    : payment.purpose || "-";
}

function paymentFailure(payment: AdminBookingPayment) {
  return payment.failure_code || payment.failure_message
    ? [payment.failure_code, payment.failure_message].filter(Boolean).join(": ")
    : "-";
}

function paymentKey(payment: AdminBookingPayment, index: number) {
  return (
    payment.id ||
    `${payment.purpose || "payment"}-${
      payment.stripe_payment_intent_id || payment.stripe_charge_id || index
    }-${index}`
  );
}

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}

function coordinates(booking: AdminBookingDetailType) {
  if (booking.latitude === null || booking.latitude === undefined) return "-";
  if (booking.longitude === null || booking.longitude === undefined) return "-";
  return `${booking.latitude}, ${booking.longitude}`;
}
