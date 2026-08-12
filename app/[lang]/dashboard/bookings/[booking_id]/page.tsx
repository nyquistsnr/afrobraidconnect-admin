import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasLocale } from "@/app/[lang]/dictionaries";
import { getAdminBookingsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import { AdminBookingDetail } from "@/components/dashboard/bookings/admin-booking-detail";
import { ApiError } from "@/lib/api/http";
import { adminBookingsApi } from "@/lib/api/admin-bookings-client";
import type { AdminBookingDetail as AdminBookingDetailType } from "@/lib/api/types";
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
  const dict = getAdminBookingsDict(locale);
  const session = await auth();
  if (!session?.accessToken || session.user.userType !== "ADMIN") {
    redirect(`/${locale}/login`);
  }

  let booking: AdminBookingDetailType;

  try {
    booking = await adminBookingsApi.get(session.accessToken, locale, bookingId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    console.error("Failed to load admin booking detail:", error);
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">
          {dict.detail.errorTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dict.detail.errorDescription}
        </p>
      </div>
    );
  }

  return (
    <AdminBookingDetail
      booking={booking}
      lang={locale}
      dict={dict}
    />
  );
}
