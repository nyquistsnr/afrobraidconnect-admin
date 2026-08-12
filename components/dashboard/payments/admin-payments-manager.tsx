"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CreditCard, ExternalLink, Filter, RotateCcw, Search } from "lucide-react";
import type { AdminPaymentsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import {
  braiderName,
  compactDateTime,
  customerName,
  moneyFromMinor,
  paymentAmountMinor,
  refundedMinor,
} from "@/components/dashboard/admin-commerce/formatters";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select, type SelectOption } from "@/components/ui/select";
import type {
  AdminPaymentListItem,
  AdminPaymentsListParams,
  PaginationMeta,
  PaymentPurpose,
  PaymentStatus,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

type PaymentsDict = AdminPaymentsDict;

const paymentPurposes: PaymentPurpose[] = ["FULL", "DEPOSIT", "BALANCE"];

const paymentStatuses: PaymentStatus[] = [
  "PENDING",
  "SUCCEEDED",
  "FAILED",
  "CANCELED",
  "PROCESSING",
  "REQUIRES_ACTION",
  "REFUNDED",
];

type RefundedFilter = "true" | "false";
type CurrencyFilter = "EUR" | "GBP" | "USD";

const statusTone: Record<PaymentStatus, BadgeTone> = {
  PENDING: "warning",
  SUCCEEDED: "success",
  FAILED: "danger",
  CANCELED: "neutral",
  PROCESSING: "info",
  REQUIRES_ACTION: "warning",
  REFUNDED: "neutral",
};

export function AdminPaymentsManager({
  lang,
  dict,
  payments,
  pagination,
  filters,
  initialLoadError,
}: {
  lang: Locale;
  dict: PaymentsDict;
  payments: AdminPaymentListItem[];
  pagination: PaginationMeta;
  filters: AdminPaymentsListParams;
  initialLoadError: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasActiveFilters = Boolean(
    filters.search ||
      filters.purpose ||
      filters.status ||
      filters.date_from ||
      filters.date_to ||
      filters.booking_date_from ||
      filters.booking_date_to ||
      filters.currency ||
      filters.is_refunded !== undefined
  );
  const [filtersOpen, setFiltersOpen] = useState(hasActiveFilters);
  const safePagination = pagination || {
    page: filters.page ?? 1,
    page_size: filters.page_size ?? 20,
    total_items: payments.length,
    total_pages: payments.length > 0 ? 1 : 0,
    has_next: false,
    has_previous: false,
  };

  const columns: DataTableColumn<AdminPaymentListItem>[] = [
    {
      key: "created",
      header: dict.table.created,
      render: (payment) => (
        <div>
          <p className="font-medium">{compactDateTime(payment.created_at, lang)}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {payment.id}
          </p>
        </div>
      ),
    },
    {
      key: "booking",
      header: dict.table.booking,
      render: (payment) => (
        <div className="min-w-48">
          <Link
            href={`/${lang}/dashboard/bookings/${payment.booking_id}`}
            className="inline-flex items-center gap-1 font-semibold text-brand hover:text-brand-hover"
          >
            {payment.booking_reference || payment.booking_id}
            <ExternalLink className="size-3.5" />
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            {compactDateTime(payment.booking_starts_at, lang)}
          </p>
        </div>
      ),
    },
    {
      key: "people",
      header: dict.table.people,
      render: (payment) => (
        <div className="min-w-52 space-y-1">
          <PersonLine label={dict.table.customer} value={customerName(payment)} />
          <PersonLine label={dict.table.braider} value={braiderName(payment)} />
        </div>
      ),
    },
    {
      key: "purpose",
      header: dict.table.purpose,
      render: (payment) => (
        <div className="space-y-2">
          <PurposeBadge purpose={payment.purpose || "-"} dict={dict} />
          <PaymentStatusBadge status={payment.status || "-"} dict={dict} />
        </div>
      ),
    },
    {
      key: "amount",
      header: dict.table.amount,
      align: "right",
      render: (payment) => (
        <div className="text-right">
          <p className="font-semibold">
            {moneyFromMinor(paymentAmountMinor(payment), payment.currency, lang)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {Number(refundedMinor(payment) ?? 0) > 0
              ? `${dict.table.refunded}: ${moneyFromMinor(refundedMinor(payment), payment.currency, lang)}`
              : dict.table.notRefunded}
          </p>
        </div>
      ),
    },
    {
      key: "stripe",
      header: dict.table.stripe,
      render: (payment) => (
        <div className="max-w-48 space-y-1 font-mono text-xs text-muted-foreground">
          <p className="truncate">{payment.stripe_payment_intent_id || "-"}</p>
          <p className="truncate">{payment.stripe_charge_id || "-"}</p>
        </div>
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

  function applyFilters(nextFilters: AdminPaymentsListParams) {
    const params = new URLSearchParams();

    if (nextFilters.search) params.set("search", nextFilters.search);
    if (nextFilters.purpose) params.set("purpose", nextFilters.purpose);
    if (nextFilters.status) params.set("status", nextFilters.status);
    if (nextFilters.date_from) params.set("date_from", nextFilters.date_from);
    if (nextFilters.date_to) params.set("date_to", nextFilters.date_to);
    if (nextFilters.booking_date_from) params.set("booking_date_from", nextFilters.booking_date_from);
    if (nextFilters.booking_date_to) params.set("booking_date_to", nextFilters.booking_date_to);
    if (nextFilters.currency) params.set("currency", nextFilters.currency);
    if (nextFilters.is_refunded !== undefined) params.set("is_refunded", String(nextFilters.is_refunded));

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

      {initialLoadError && (
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
          resetHref={`/${lang}/dashboard/payments`}
        />
      )}

      <section className="border border-border bg-surface shadow-sm">
        <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="mt-0.5 bg-brand/10 p-2 text-brand">
            <CreditCard className="size-5" />
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
          data={payments}
          getRowKey={(payment) => payment.id}
          renderMobileCard={(payment) => (
            <PaymentCard payment={payment} dict={dict} lang={lang} />
          )}
          emptyState={
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {dict.emptyTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {dict.emptyDescription}
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
  dict: PaymentsDict;
  filters: AdminPaymentsListParams;
  onSubmit: (filters: AdminPaymentsListParams) => void;
  resetHref: string;
}) {
  const [search, setSearch] = useState(filters.search ?? "");
  const [purpose, setPurpose] = useState<PaymentPurpose | "">(filters.purpose ?? "");
  const [status, setStatus] = useState<PaymentStatus | "">(filters.status ?? "");
  const [paymentFrom, setPaymentFrom] = useState(filters.date_from ?? "");
  const [paymentTo, setPaymentTo] = useState(filters.date_to ?? "");
  const [bookingFrom, setBookingFrom] = useState(filters.booking_date_from ?? "");
  const [bookingTo, setBookingTo] = useState(filters.booking_date_to ?? "");
  const [currency, setCurrency] = useState<CurrencyFilter | "">(
    filters.currency === "EUR" || filters.currency === "GBP" || filters.currency === "USD"
      ? filters.currency
      : ""
  );
  const [isRefunded, setIsRefunded] = useState<RefundedFilter | "">(
    filters.is_refunded === undefined ? "" : String(filters.is_refunded) as RefundedFilter
  );

  const purposeOptions: SelectOption<PaymentPurpose>[] = paymentPurposes.map((value) => ({
    value,
    label: dict.purposeLabels[value],
  }));
  const statusOptions: SelectOption<PaymentStatus>[] = paymentStatuses.map((value) => ({
    value,
    label: dict.statusLabels[value],
  }));
  const refundedOptions: SelectOption<RefundedFilter>[] = [
    { value: "true", label: dict.filters.refundedYes },
    { value: "false", label: dict.filters.refundedNo },
  ];
  const currencyOptions: SelectOption<CurrencyFilter>[] = [
    { value: "EUR", label: dict.filters.eur },
    { value: "GBP", label: dict.filters.gbp },
    { value: "USD", label: dict.filters.usd },
  ];

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      search: search.trim() || undefined,
      purpose: purpose || undefined,
      status: status || undefined,
      date_from: paymentFrom || undefined,
      date_to: paymentTo || undefined,
      booking_date_from: bookingFrom || undefined,
      booking_date_to: bookingTo || undefined,
      currency: currency || undefined,
      is_refunded: isRefunded ? isRefunded === "true" : undefined,
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
          label={dict.filters.purpose}
          showLabel
          value={purpose}
          onChange={setPurpose}
          options={purposeOptions}
          placeholder={dict.filters.allPurposes}
        />
        <Select
          label={dict.filters.status}
          showLabel
          value={status}
          onChange={setStatus}
          options={statusOptions}
          placeholder={dict.filters.allStatuses}
        />
        <Select
          label={dict.filters.refunded}
          showLabel
          value={isRefunded}
          onChange={setIsRefunded}
          options={refundedOptions}
          placeholder={dict.filters.all}
        />
        <DateRangePicker
          label={dict.filters.paymentRange}
          dateFrom={paymentFrom}
          dateTo={paymentTo}
          onChange={(from, to) => {
            setPaymentFrom(from);
            setPaymentTo(to);
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
          label={dict.filters.bookingRange}
          dateFrom={bookingFrom}
          dateTo={bookingTo}
          onChange={(from, to) => {
            setBookingFrom(from);
            setBookingTo(to);
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
          label={dict.filters.currency}
          showLabel
          value={currency}
          onChange={setCurrency}
          options={currencyOptions}
          placeholder={dict.filters.allCurrencies}
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

function PaymentCard({
  payment,
  dict,
  lang,
}: {
  payment: AdminPaymentListItem;
  dict: PaymentsDict;
  lang: Locale;
}) {
  return (
    <div className="border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <PaymentStatusBadge status={payment.status || "-"} dict={dict} />
          <PurposeBadge purpose={payment.purpose || "-"} dict={dict} />
          <p className="truncate font-semibold text-foreground">
            {moneyFromMinor(paymentAmountMinor(payment), payment.currency, lang)}
          </p>
        </div>
        <Link
          href={`/${lang}/dashboard/bookings/${payment.booking_id}`}
          aria-label={`${dict.table.booking} ${payment.booking_id}`}
          className="p-2 text-muted-foreground hover:bg-border/40 hover:text-foreground"
        >
          <ExternalLink className="size-4" />
        </Link>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <MobileDetail label={dict.table.created} value={compactDateTime(payment.created_at, lang)} />
        <MobileDetail label={dict.table.booking} value={payment.booking_reference || payment.booking_id} />
        <MobileDetail label={dict.table.customer} value={customerName(payment)} />
        <MobileDetail label={dict.table.braider} value={braiderName(payment)} />
        <MobileDetail label={dict.table.refunded} value={moneyFromMinor(refundedMinor(payment), payment.currency, lang)} />
      </dl>
    </div>
  );
}

function PaymentStatusBadge({
  status,
  dict,
}: {
  status: PaymentStatus | string;
  dict: PaymentsDict;
}) {
  const known = paymentStatuses.includes(status as PaymentStatus);
  return (
    <Badge tone={known ? statusTone[status as PaymentStatus] : "neutral"} dot={false}>
      {known ? dict.statusLabels[status as PaymentStatus] : status}
    </Badge>
  );
}

function PurposeBadge({
  purpose,
  dict,
}: {
  purpose: PaymentPurpose | string;
  dict: PaymentsDict;
}) {
  const known = paymentPurposes.includes(purpose as PaymentPurpose);
  return (
    <Badge tone="brand" dot={false}>
      {known ? dict.purposeLabels[purpose as PaymentPurpose] : purpose}
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
