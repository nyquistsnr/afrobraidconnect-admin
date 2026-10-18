import { notFound } from "next/navigation";
import { hasLocale } from "@/app/[lang]/dictionaries";
import { getAdminBookingsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import { AdminBookingDetailPageClient } from "@/components/dashboard/bookings/admin-booking-detail-page-client";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "en";
  return { title: `${getAdminBookingsDict(locale).detail.eyebrow} - Admin` };
}

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ lang: string; booking_id: string }>;
}) {
  const { lang, booking_id: bookingId } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  // Loaded and cached client-side (TanStack Query), so reopening a booking doesn't refetch.
  return (
    <AdminBookingDetailPageClient
      lang={locale}
      dict={getAdminBookingsDict(locale)}
      bookingId={bookingId}
    />
  );
}
