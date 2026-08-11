import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getDictionary, hasLocale, locales } from "../../../dictionaries";
import { auth } from "@/auth";
import { bookingsApi } from "@/lib/api/bookings-client";
import { BookingDetail } from "@/components/dashboard/booking-detail";



export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
    redirect(`/${lang}/login`);
  }

  const dict = await getDictionary(lang);
  let booking;

  try {
    booking = await bookingsApi.getById(session.accessToken, id, lang);
  } catch (error) {
    console.error("Failed to fetch booking details:", error);
    notFound();
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <Link
          href={`/${lang}/dashboard/bookings`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground mb-4"
        >
          <ChevronLeft className="size-4" />
          {dict.common.back || "Back to bookings"}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {dict.dashboard.bookings.detail.title}
        </h1>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <BookingDetail
          booking={booking}
          lang={lang}
          dict={dict.dashboard.bookings}
          common={dict.common}
        />
      </div>
    </div>
  );
}
