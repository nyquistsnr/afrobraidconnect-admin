import { notFound } from "next/navigation";
import { hasLocale } from "@/app/[lang]/dictionaries";
import {
  chartParamsFromListParams,
  parseScopedBookingListParams,
  statsParamsFromListParams,
} from "@/app/[lang]/dashboard/bookings/scoped-helpers";
import { getAdminBookingsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import {
  ScopedBookingsPageClient,
  type ScopeKind,
} from "@/components/dashboard/bookings/scoped-bookings-page-client";
import type { Locale } from "@/lib/i18n";

/**
 * Parses the URL on the server; the data itself is loaded and cached
 * client-side (TanStack Query) so revisits and back/forward don't refetch.
 */
export async function renderScopedBookingsPage({
  lang,
  searchParams,
  scopeKind,
  braiderId,
  customerId,
}: {
  lang: string;
  searchParams: { [key: string]: string | string[] | undefined };
  scopeKind: ScopeKind;
  braiderId?: string;
  customerId?: string;
}) {
  if (!hasLocale(lang)) notFound();

  const locale = lang as Locale;
  const filters = parseScopedBookingListParams(searchParams);

  return (
    <ScopedBookingsPageClient
      lang={locale}
      dict={getAdminBookingsDict(locale)}
      scopeKind={scopeKind}
      braiderId={braiderId}
      customerId={customerId}
      filters={filters}
      statsFilters={statsParamsFromListParams(searchParams, filters)}
      chartFilters={chartParamsFromListParams(searchParams, filters)}
    />
  );
}
