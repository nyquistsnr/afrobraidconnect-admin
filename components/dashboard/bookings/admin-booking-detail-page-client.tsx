"use client";

import BookingDetailLoading from "@/app/[lang]/dashboard/bookings/[booking_id]/loading";
import type { AdminBookingsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import { AdminBookingDetail } from "@/components/dashboard/bookings/admin-booking-detail";
import { adminBookingsApi } from "@/lib/api/admin-bookings-client";
import type { Locale } from "@/lib/i18n";
import { adminKeys } from "@/lib/query-keys";
import { useAdminQuery } from "@/lib/use-admin-query";

export function AdminBookingDetailPageClient({
  lang,
  dict,
  bookingId,
}: {
  lang: Locale;
  dict: AdminBookingsDict;
  bookingId: string;
}) {
  const query = useAdminQuery([...adminKeys.bookings, "detail", lang, bookingId], (token) =>
    adminBookingsApi.get(token, lang, bookingId)
  );
  if (query.isPending) return <BookingDetailLoading />;

  if (query.isError || !query.data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">{dict.detail.errorTitle}</h1>
        <p className="text-sm text-muted-foreground">{dict.detail.errorDescription}</p>
      </div>
    );
  }

  return <AdminBookingDetail booking={query.data} lang={lang} dict={dict} />;
}
