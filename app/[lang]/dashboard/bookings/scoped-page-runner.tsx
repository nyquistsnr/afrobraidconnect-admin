import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasLocale } from "@/app/[lang]/dictionaries";
import {
  fallbackPagination,
  parseScopedBookingListParams,
  statsParamsFromListParams,
} from "@/app/[lang]/dashboard/bookings/scoped-helpers";
import { getAdminBookingsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import { ScopedBookingsPage } from "@/components/dashboard/bookings/scoped-bookings-page";
import { adminBookingsApi } from "@/lib/api/admin-bookings-client";
import type {
  AdminBookingListItem,
  AdminBookingStats,
  PaginationMeta,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

type ScopeKind = "braider" | "customer" | "relationship";

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
  const session = await auth();
  if (!session?.accessToken || session.user.userType !== "ADMIN") {
    redirect(`/${locale}/login`);
  }

  const dict = getAdminBookingsDict(locale);
  const filters = parseScopedBookingListParams(searchParams);
  const statsFilters = statsParamsFromListParams(searchParams, filters);
  let bookings: AdminBookingListItem[] = [];
  let stats: AdminBookingStats | null = null;
  let pagination: PaginationMeta = {
    page: filters.page ?? 1,
    page_size: 20,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  };
  let initialLoadError = false;
  let statsLoadError = false;

  try {
    const response =
      scopeKind === "relationship" && braiderId && customerId
        ? await adminBookingsApi.listForBraiderCustomer(
            session.accessToken,
            locale,
            braiderId,
            customerId,
            filters
          )
        : scopeKind === "braider" && braiderId
          ? await adminBookingsApi.listForBraider(
              session.accessToken,
              locale,
              braiderId,
              filters
            )
          : customerId
            ? await adminBookingsApi.listForCustomer(
                session.accessToken,
                locale,
                customerId,
                filters
              )
            : null;

    bookings = Array.isArray(response?.items) ? response.items : [];
    pagination =
      response?.pagination ??
      fallbackPagination(filters.page ?? 1, filters.page_size ?? 20, bookings.length);
  } catch (error) {
    initialLoadError = true;
    console.warn(
      "Failed to load scoped admin bookings:",
      error instanceof Error ? error.message : error
    );
  }

  try {
    stats =
      scopeKind === "relationship" && braiderId && customerId
        ? await adminBookingsApi.statsForBraiderCustomer(
            session.accessToken,
            locale,
            braiderId,
            customerId,
            statsFilters
          )
        : scopeKind === "braider" && braiderId
          ? await adminBookingsApi.statsForBraider(
              session.accessToken,
              locale,
              braiderId,
              statsFilters
            )
          : customerId
            ? await adminBookingsApi.statsForCustomer(
                session.accessToken,
                locale,
                customerId,
                statsFilters
              )
            : null;
  } catch (error) {
    statsLoadError = true;
    console.warn(
      "Failed to load scoped admin booking stats:",
      error instanceof Error ? error.message : error
    );
  }

  return (
    <ScopedBookingsPage
      lang={locale}
      dict={dict}
      scopeKind={scopeKind}
      title={scopedTitle(scopeKind)}
      subtitle={scopedSubtitle(scopeKind, braiderId, customerId)}
      stats={stats}
      statsLoadError={statsLoadError}
      bookings={bookings}
      pagination={pagination}
      filters={filters}
      initialLoadError={initialLoadError}
    />
  );
}

function scopedTitle(scopeKind: ScopeKind) {
  if (scopeKind === "relationship") return "Braider and customer bookings";
  if (scopeKind === "braider") return "Braider bookings";
  return "Customer bookings";
}

function scopedSubtitle(scopeKind: ScopeKind, braiderId?: string, customerId?: string) {
  if (scopeKind === "relationship") {
    return `Braider ${braiderId || "-"} with customer ${customerId || "-"}`;
  }
  if (scopeKind === "braider") return `Braider profile ${braiderId || "-"}`;
  return `Customer ${customerId || "-"}`;
}
