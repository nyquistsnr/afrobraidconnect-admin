"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Eye, Filter, RotateCcw, Search } from "lucide-react";
import type { AdminBookingsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import {
  bookingReference,
  bookingTotalMinor,
  braiderName,
  compactDateTime,
  customerName,
  extractPagination,
  moneyFromMinor,
} from "@/components/dashboard/admin-commerce/formatters";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select, type SelectOption } from "@/components/ui/select";
import { adminBookingsApi } from "@/lib/api/admin-bookings-client";
import type {
  AdminBookingListItem,
  AdminBookingsListParams,
  BookingStatus,
  PaginationMeta,
  PaymentSchedule,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

type BookingsDict = AdminBookingsDict;

const bookingStatuses: BookingStatus[] = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "NO_SHOW",
  "CANCELLED_BY_CUSTOMER",
  "CANCELLED_BY_BRAIDER",
  "CANCELLED_NO_PAYMENT",
  "EXPIRED",
  "DISPUTED",
];

const paymentSchedules: PaymentSchedule[] = [
  "FULL_UPFRONT",
  "DEPOSIT_THEN_BALANCE",
];

type MobileFilter = "true" | "false";
type CountryFilter = "DE" | "FR";
type CurrencyFilter = "EUR" | "GBP" | "USD";

const countryOptions: SelectOption<CountryFilter>[] = [
  { value: "DE", label: "DE" },
  { value: "FR", label: "FR" },
];

const statusTone: Record<BookingStatus, BadgeTone> = {
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

export function AdminBookingsManager({
  lang,
  dict,
  bookings: initialBookings,
  pagination: initialPagination,
  filters,
  initialLoadError = false,
}: {
  lang: Locale;
  dict: BookingsDict;
  bookings?: AdminBookingListItem[];
  pagination?: PaginationMeta;
  filters: AdminBookingsListParams;
  initialLoadError?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const bookingsQuery = useQuery({
    queryKey: ["admin-bookings", lang, filters],
    queryFn: async () => {
      const response = await adminBookingsApi.list(accessToken!, lang, filters);
      const items = Array.isArray(response.items) ? response.items : [];
      return {
        bookings: items,
        pagination: extractPagination(
          response,
          filters.page ?? 1,
          filters.page_size ?? 20,
          items.length
        ),
      };
    },
    enabled: Boolean(accessToken),
    initialData:
      initialBookings && initialPagination
        ? { bookings: initialBookings, pagination: initialPagination }
        : undefined,
  });
  const bookings = bookingsQuery.data?.bookings ?? [];
  const hasActiveFilters = Boolean(
    filters.search ||
      filters.status ||
      filters.date_from ||
      filters.date_to ||
      filters.created_from ||
      filters.created_to ||
      filters.country ||
      filters.currency ||
      filters.is_mobile !== undefined ||
      filters.payment_schedule
  );
  const [filtersOpen, setFiltersOpen] = useState(hasActiveFilters);
  const safePagination: PaginationMeta = bookingsQuery.data?.pagination || {
    page: filters.page ?? 1,
    page_size: filters.page_size ?? 20,
    total_items: bookings.length,
    total_pages: bookings.length > 0 ? 1 : 0,
    has_next: false,
    has_previous: false,
  };

  const columns: DataTableColumn<AdminBookingListItem>[] = [
    {
      key: "created",
      header: dict.table.created,
      render: (booking) => (
        <div>
          <p className="font-medium">{compactDateTime(booking.created_at, lang)}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {bookingReference(booking)}
          </p>
        </div>
      ),
    },
    {
      key: "people",
      header: dict.table.people,
      render: (booking) => (
        <div className="min-w-52 space-y-1">
          <PersonLine label={dict.table.customer} value={customerName(booking)} />
          <PersonLine label={dict.table.braider} value={braiderName(booking)} />
        </div>
      ),
    },
    {
      key: "appointment",
      header: dict.table.appointment,
      render: (booking) => (
        <div>
          <p className="font-medium">
            {compactDateTime(booking.starts_at, lang)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {booking.style_name || dict.table.noStyle}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: dict.table.status,
      render: (booking) => <BookingStatusBadge status={booking.status} dict={dict} />,
    },
    {
      key: "total",
      header: dict.table.total,
      align: "right",
      render: (booking) => (
        <div className="text-right">
          <p className="font-semibold">
            {moneyFromMinor(bookingTotalMinor(booking), booking.currency, lang)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {booking.is_mobile ? dict.table.mobile : dict.table.studio}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      header: dict.table.actions,
      align: "right",
      render: (booking) => (
        <Link
          href={`/${lang}/dashboard/bookings/${booking.id}`}
          className="inline-flex items-center gap-2 border border-border bg-input px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-border/40"
        >
          <Eye className="size-4" />
          {dict.table.view}
        </Link>
      ),
    },
  ];

  const summary = dict.pagination.summary
    .replace("{page}", String(safePagination.page))
    .replace("{totalPages}", String(safePagination.total_pages || 1))
    .replace("{totalItems}", String(safePagination.total_items));

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyFilters(nextFilters: AdminBookingsListParams) {
    const params = new URLSearchParams();

    if (nextFilters.search) params.set("search", nextFilters.search);
    if (nextFilters.status) params.set("status", nextFilters.status);
    if (nextFilters.date_from) params.set("date_from", nextFilters.date_from);
    if (nextFilters.date_to) params.set("date_to", nextFilters.date_to);
    if (nextFilters.created_from) params.set("created_from", nextFilters.created_from);
    if (nextFilters.created_to) params.set("created_to", nextFilters.created_to);
    if (nextFilters.country) params.set("country", nextFilters.country);
    if (nextFilters.currency) params.set("currency", nextFilters.currency);
    if (nextFilters.is_mobile !== undefined) params.set("is_mobile", String(nextFilters.is_mobile));
    if (nextFilters.payment_schedule) params.set("payment_schedule", nextFilters.payment_schedule);

    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-brand">{dict.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {dict.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{dict.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          className="inline-flex w-fit items-center justify-center gap-2 border border-border bg-input px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-border/40"
        >
          <Filter className="size-4" />
          {filtersOpen ? dict.hideFilters : dict.showFilters}
        </button>
      </div>

      {(initialLoadError || bookingsQuery.isError) && (
        <div className="border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          {dict.loadError}
        </div>
      )}

      {filtersOpen && (
        <FilterForm
          lang={lang}
          dict={dict}
          filters={filters}
          onSubmit={applyFilters}
          resetHref={`/${lang}/dashboard/bookings`}
        />
      )}

      <section className="border border-border bg-surface shadow-sm">
        <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="mt-0.5 bg-brand/10 p-2 text-brand">
            <CalendarCheck className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              {dict.listTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dict.listSubtitle}
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={bookings}
          getRowKey={(booking) => booking.id}
          renderMobileCard={(booking) => (
            <BookingCard booking={booking} dict={dict} lang={lang} />
          )}
          emptyState={
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {bookingsQuery.isLoading ? dict.listTitle : dict.emptyTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {bookingsQuery.isLoading ? dict.listSubtitle : dict.emptyDescription}
              </p>
            </div>
          }
        />

        <Pagination
          page={safePagination.page}
          totalPages={safePagination.total_pages}
          hasNext={safePagination.has_next}
          hasPrevious={safePagination.has_previous}
          onPageChange={goToPage}
          summary={summary}
          previousLabel={dict.pagination.previous}
          nextLabel={dict.pagination.next}
        />
      </section>
    </div>
  );
}

function FilterForm({
  lang,
  dict,
  filters,
  onSubmit,
  resetHref,
}: {
  lang: Locale;
  dict: BookingsDict;
  filters: AdminBookingsListParams;
  onSubmit: (filters: AdminBookingsListParams) => void;
  resetHref: string;
}) {
  const [search, setSearch] = useState(filters.search ?? "");
  const [status, setStatus] = useState<BookingStatus | "">(filters.status ?? "");
  const [appointmentFrom, setAppointmentFrom] = useState(filters.date_from ?? "");
  const [appointmentTo, setAppointmentTo] = useState(filters.date_to ?? "");
  const [createdFrom, setCreatedFrom] = useState(filters.created_from ?? "");
  const [createdTo, setCreatedTo] = useState(filters.created_to ?? "");
  const [country, setCountry] = useState<CountryFilter | "">(
    filters.country === "DE" || filters.country === "FR" ? filters.country : ""
  );
  const [currency, setCurrency] = useState<CurrencyFilter | "">(
    filters.currency === "EUR" || filters.currency === "GBP" || filters.currency === "USD"
      ? filters.currency
      : ""
  );
  const [isMobile, setIsMobile] = useState<MobileFilter | "">(
    filters.is_mobile === undefined ? "" : String(filters.is_mobile) as MobileFilter
  );
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule | "">(
    filters.payment_schedule ?? ""
  );

  const statusOptions: SelectOption<BookingStatus>[] = bookingStatuses.map((value) => ({
    value,
    label: dict.statusLabels[value],
  }));
  const mobileOptions: SelectOption<MobileFilter>[] = [
    { value: "true", label: dict.filters.mobileYes },
    { value: "false", label: dict.filters.mobileNo },
  ];
  const paymentScheduleOptions: SelectOption<PaymentSchedule>[] = paymentSchedules.map((value) => ({
    value,
    label: dict.paymentScheduleLabels[value],
  }));
  const currencyOptions: SelectOption<CurrencyFilter>[] = [
    { value: "EUR", label: dict.filters.eur },
    { value: "GBP", label: dict.filters.gbp },
    { value: "USD", label: dict.filters.usd },
  ];

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      search: search.trim() || undefined,
      status: status || undefined,
      date_from: appointmentFrom || undefined,
      date_to: appointmentTo || undefined,
      created_from: createdFrom || undefined,
      created_to: createdTo || undefined,
      country: country || undefined,
      currency: currency || undefined,
      is_mobile: isMobile ? isMobile === "true" : undefined,
      payment_schedule: paymentSchedule || undefined,
    });
  }

  return (
    <form onSubmit={submit} className="border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Filter className="size-4 text-brand" />
        {dict.filters.title}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input
          name="search"
          label={dict.filters.searchLabel}
          showLabel
          icon={Search}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={dict.filters.searchPlaceholder}
        />
        <Select
          label={dict.filters.statusLabel}
          showLabel
          value={status}
          onChange={setStatus}
          options={statusOptions}
          placeholder={dict.filters.allStatuses}
        />
        <DateRangePicker
          label={dict.filters.appointmentRange}
          dateFrom={appointmentFrom}
          dateTo={appointmentTo}
          onChange={(from, to) => {
            setAppointmentFrom(from);
            setAppointmentTo(to);
          }}
          placeholder={dict.filters.dateRangePlaceholder}
          presetsLabel={dict.filters.presets}
          todayLabel={dict.filters.today}
          last7DaysLabel={dict.filters.last7Days}
          thisMonthLabel={dict.filters.thisMonth}
          lastMonthLabel={dict.filters.lastMonth}
          clearLabel={dict.filters.clear}
          applyLabel={dict.filters.applyRange}
          previousMonthLabel={dict.filters.previousMonth}
          nextMonthLabel={dict.filters.nextMonth}
          lang={lang}
        />
        <DateRangePicker
          label={dict.filters.createdRange}
          dateFrom={createdFrom}
          dateTo={createdTo}
          onChange={(from, to) => {
            setCreatedFrom(from);
            setCreatedTo(to);
          }}
          placeholder={dict.filters.dateRangePlaceholder}
          presetsLabel={dict.filters.presets}
          todayLabel={dict.filters.today}
          last7DaysLabel={dict.filters.last7Days}
          thisMonthLabel={dict.filters.thisMonth}
          lastMonthLabel={dict.filters.lastMonth}
          clearLabel={dict.filters.clear}
          applyLabel={dict.filters.applyRange}
          previousMonthLabel={dict.filters.previousMonth}
          nextMonthLabel={dict.filters.nextMonth}
          lang={lang}
        />
        <Select
          label={dict.filters.country}
          showLabel
          value={country}
          onChange={setCountry}
          options={countryOptions}
          placeholder={dict.filters.allCountries}
        />
        <Select
          label={dict.filters.currency}
          showLabel
          value={currency}
          onChange={setCurrency}
          options={currencyOptions}
          placeholder={dict.filters.allCurrencies}
        />
        <Select
          label={dict.filters.mobile}
          showLabel
          value={isMobile}
          onChange={setIsMobile}
          options={mobileOptions}
          placeholder={dict.filters.all}
        />
        <Select
          label={dict.filters.paymentSchedule}
          showLabel
          value={paymentSchedule}
          onChange={setPaymentSchedule}
          options={paymentScheduleOptions}
          placeholder={dict.filters.all}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Link
          href={resetHref}
          className="inline-flex items-center justify-center gap-2 border border-border bg-input px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-border/40"
        >
          <RotateCcw className="size-4" />
          {dict.filters.reset}
        </Link>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
        >
          <Filter className="size-4" />
          {dict.filters.apply}
        </button>
      </div>
    </form>
  );
}

function BookingCard({
  booking,
  dict,
  lang,
}: {
  booking: AdminBookingListItem;
  dict: BookingsDict;
  lang: Locale;
}) {
  return (
    <div className="border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <BookingStatusBadge status={booking.status} dict={dict} />
          <p className="mt-3 truncate font-semibold text-foreground">
            {booking.style_name || dict.table.noStyle}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {bookingReference(booking)}
          </p>
        </div>
        <Link
          href={`/${lang}/dashboard/bookings/${booking.id}`}
          aria-label={`${dict.table.view} ${booking.id}`}
          className="p-2 text-muted-foreground hover:bg-border/40 hover:text-foreground"
        >
          <Eye className="size-4" />
        </Link>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <MobileDetail label={dict.table.customer} value={customerName(booking)} />
        <MobileDetail label={dict.table.braider} value={braiderName(booking)} />
        <MobileDetail label={dict.table.appointment} value={compactDateTime(booking.starts_at, lang)} />
        <MobileDetail label={dict.table.total} value={moneyFromMinor(bookingTotalMinor(booking), booking.currency, lang)} />
      </dl>
    </div>
  );
}

function BookingStatusBadge({
  status,
  dict,
}: {
  status: BookingStatus | string;
  dict: BookingsDict;
}) {
  const known = bookingStatuses.includes(status as BookingStatus);
  return (
    <Badge tone={known ? statusTone[status as BookingStatus] : "neutral"} dot={false}>
      {known ? dict.statusLabels[status as BookingStatus] : status}
    </Badge>
  );
}

function PersonLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm">
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{value}</span>
    </p>
  );
}

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-foreground">{value}</dd>
    </div>
  );
}
