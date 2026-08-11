"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Clock3, CreditCard, MapPin, MessageSquare } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { BookingDetailResponse, BookingStatus } from "@/lib/api/types";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { chatApi } from "@/lib/api/chat-client";
import { getAuthErrorMessage } from "@/lib/api/error-messages";

type BookingsDict = Dictionary["dashboard"]["bookings"];

export const STATUS_TONE: Record<BookingStatus, BadgeTone> = {
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

export function StatusBadge({
  status,
  dict,
}: {
  status: BookingStatus;
  dict: BookingsDict["status"];
}) {
  return <Badge tone={STATUS_TONE[status]}>{dict[status]}</Badge>;
}

export function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

export function BookingDetail({
  booking,
  lang,
  dict,
  common,
}: {
  booking: BookingDetailResponse;
  lang: Locale;
  dict: BookingsDict;
  common: Dictionary["common"];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const d = dict.detail;
  const hasDeposit = booking.payment_schedule === "DEPOSIT_THEN_BALANCE";
  // Chat opens once a successful payment exists — stays available even if
  // the booking is later cancelled — so gate on payment history rather than
  // surfacing the backend's CHAT_NOT_AVAILABLE error.
  const canChat = booking.payments.some((payment) => payment.status === "SUCCEEDED");

  const openChatMutation = useMutation({
    mutationFn: () => chatApi.getBookingThread(accessToken!, booking.id, lang),
    onSuccess: (thread) => router.push(`/${lang}/dashboard/chat/${thread.id}`),
    onError: (error: Error) => toast.error(getAuthErrorMessage(error.message, common.errors)),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{d.reference}</p>
          <p className="font-mono text-sm font-semibold text-foreground">
            {booking.reference}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={booking.status} dict={dict.status} />
          {canChat && (
            <Button
              type="button"
              variant="outline"
              className="w-auto"
              disabled={openChatMutation.isPending}
              onClick={() => openChatMutation.mutate()}
            >
              <MessageSquare className="size-4" />
              {d.chatButton}
            </Button>
          )}
        </div>
      </div>

      <section className="border border-border">
        <div className="divide-y divide-border px-4">
          <DetailRow label={d.customer} value={booking.customer_name} />
          <DetailRow label={d.style} value={booking.style_name} />
          <DetailRow
            label={d.duration}
            value={d.durationMinutes.replace(
              "{minutes}",
              String(booking.duration_minutes)
            )}
          />
          <DetailRow
            label={d.location}
            value={
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0 text-icon-muted" />
                {booking.is_mobile
                  ? booking.client_address ?? d.mobileService
                  : d.studioService}
              </span>
            }
          />
          <DetailRow
            label={d.schedule}
            value={
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5 shrink-0 text-icon-muted" />
                {formatDate(booking.starts_at, lang)} ·{" "}
                {formatTime(booking.starts_at, lang)}–
                {formatTime(booking.ends_at, lang)}
              </span>
            }
          />
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-foreground">
          {d.itemsTitle}
        </h3>
        <div className="border border-border">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {booking.items.map((item, index) => (
                <tr key={`${item.item_type}-${index}`}>
                  <td className="px-3 py-2 text-foreground">
                    {item.name ?? d.itemTypes[item.item_type]}
                    {item.quantity > 1 && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        ×{item.quantity}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-foreground">
                    {formatCurrency(item.line_amount, booking.currency, lang)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divide-y divide-border border-t border-border bg-border/10 px-3">
            <DetailRow
              label={d.serviceSubtotal}
              value={formatCurrency(
                booking.service_subtotal,
                booking.currency,
                lang
              )}
            />
            {Number(booking.travel_fee) > 0 && (
              <DetailRow
                label={d.travelFee}
                value={formatCurrency(
                  booking.travel_fee,
                  booking.currency,
                  lang
                )}
              />
            )}
            <DetailRow
              label={d.subtotal}
              value={formatCurrency(booking.subtotal, booking.currency, lang)}
            />
            <DetailRow
              label={d.platformFee}
              value={formatCurrency(
                booking.platform_fee,
                booking.currency,
                lang
              )}
            />
            <DetailRow
              label={d.vatTotal}
              value={formatCurrency(booking.vat_total, booking.currency, lang)}
            />
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm font-semibold text-foreground">
                {d.total}
              </span>
              <span className="text-base font-bold text-foreground">
                {formatCurrency(booking.total, booking.currency, lang)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border border-border px-4">
        <div className="divide-y divide-border">
          <DetailRow
            label={d.paymentSchedule}
            value={d.paymentScheduleValues[booking.payment_schedule]}
          />
          {hasDeposit && (
            <>
              <DetailRow
                label={d.depositAmount}
                value={formatCurrency(
                  booking.deposit_amount,
                  booking.currency,
                  lang
                )}
              />
              <DetailRow
                label={d.balanceAmount}
                value={formatCurrency(
                  booking.balance_amount,
                  booking.currency,
                  lang
                )}
              />
            </>
          )}
        </div>
      </section>

      {booking.payments.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            {d.paymentsTitle}
          </h3>
          <ul className="divide-y divide-border border border-border">
            {booking.payments.map((payment, index) => (
              <li
                key={`${payment.purpose}-${index}`}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span className="inline-flex items-center gap-2 text-foreground">
                  <CreditCard className="size-3.5 shrink-0 text-icon-muted" />
                  {d.paymentPurpose[payment.purpose]}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">
                    {formatCurrency(payment.amount, payment.currency, lang)}
                  </span>
                  <Badge
                    tone={
                      payment.status === "SUCCEEDED"
                        ? "success"
                        : payment.status === "FAILED"
                          ? "danger"
                          : payment.status === "CANCELED"
                            ? "neutral"
                            : "warning"
                    }
                  >
                    {d.paymentStatus[payment.status]}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-muted-foreground">
        {d.cancellationCutoff}{" "}
        {formatDate(booking.cancellation_cutoff_at, lang)} ·{" "}
        {formatTime(booking.cancellation_cutoff_at, lang)}
      </p>
      <p className="text-xs text-muted-foreground">
        {d.createdAt} {formatDate(booking.created_at, lang)}
      </p>
    </div>
  );
}
