import { notFound } from "next/navigation";
import { hasLocale } from "@/app/[lang]/dictionaries";
import { getAdminBookingsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import { AdminBookingsManager } from "@/components/dashboard/bookings/admin-bookings-manager";
import {
  parseScopedBookingListParams,
} from "@/app/[lang]/dashboard/bookings/scoped-helpers";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "en";
  return { title: `${getAdminBookingsDict(locale).title} - Admin` };
}

export default async function AdminBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const dict = getAdminBookingsDict(locale);
  const resolvedSearchParams = await searchParams;
  const filters = parseScopedBookingListParams(resolvedSearchParams);

  return (
    <AdminBookingsManager
      key={JSON.stringify(filters)}
      lang={locale}
      dict={dict}
      filters={filters}
    />
  );
}
