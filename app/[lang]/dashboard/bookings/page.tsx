import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasLocale } from "@/app/[lang]/dictionaries";
import { getAdminBookingsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import { AdminBookingsManager } from "@/components/dashboard/bookings/admin-bookings-manager";
import { adminBookingsApi } from "@/lib/api/admin-bookings-client";
import {
  fallbackPagination,
  parseScopedBookingListParams,
} from "@/app/[lang]/dashboard/bookings/scoped-helpers";
import type {
  AdminBookingListItem,
  PaginationMeta,
} from "@/lib/api/types";
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
  const session = await auth();
  if (!session?.accessToken || session.user.userType !== "ADMIN") {
    redirect(`/${locale}/login`);
  }

  const resolvedSearchParams = await searchParams;
  const filters = parseScopedBookingListParams(resolvedSearchParams);
  let bookings: AdminBookingListItem[] = [];
  let pagination: PaginationMeta = {
    page: filters.page ?? 1,
    page_size: 20,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  };
  let initialLoadError = false;

  try {
    const response = await adminBookingsApi.list(
      session.accessToken,
      locale,
      filters
    );
    bookings = Array.isArray(response.items) ? response.items : [];
    pagination =
      response.pagination ??
      fallbackPagination(filters.page ?? 1, filters.page_size ?? 20, bookings.length);
  } catch (error) {
    initialLoadError = true;
    console.warn(
      "Failed to load admin bookings:",
      error instanceof Error ? error.message : error
    );
  }

  return (
    <AdminBookingsManager
      key={JSON.stringify(filters)}
      lang={locale}
      dict={dict}
      bookings={bookings}
      pagination={pagination}
      filters={filters}
      initialLoadError={initialLoadError}
    />
  );
}
