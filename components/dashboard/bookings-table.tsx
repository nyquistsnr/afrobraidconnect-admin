"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Inbox,
  Search,
  User,
  X,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import type {
  BookingListItemResponse,
  BookingListResponse,
  BookingStatus,
} from "@/lib/api/types";
import { bookingsApi } from "@/lib/api/bookings-client";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { StatusBadge } from "@/components/dashboard/booking-detail";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const SEARCH_DEBOUNCE_MS = 350;

type BookingsDict = Dictionary["dashboard"]["bookings"];

function DateTimeCell({
  startsAt,
  endsAt,
  lang,
}: {
  startsAt: string;
  endsAt: string;
  lang: Locale;
}) {
  return (
    <div>
      <p className="font-medium text-foreground">{formatDate(startsAt, lang)}</p>
      <p className="text-xs text-muted-foreground">
        {formatTime(startsAt, lang)} – {formatTime(endsAt, lang)}
      </p>
    </div>
  );
}

function BookingCard({
  booking,
  lang,
  dict,
  onClick,
}: {
  booking: BookingListItemResponse;
  lang: Locale;
  dict: BookingsDict;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-3 border border-border bg-surface p-4 text-left shadow-sm transition-colors hover:border-brand/50 hover:bg-border/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {booking.style_name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {booking.reference}
          </p>
        </div>
        <StatusBadge status={booking.status} dict={dict.status} />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <User className="size-3.5 shrink-0 text-icon-muted" />
        <span className="truncate">{booking.customer_name}</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarDays className="size-3.5 shrink-0 text-icon-muted" />
        <span>
          {formatDate(booking.starts_at, lang)} ·{" "}
          {formatTime(booking.starts_at, lang)}–{formatTime(booking.ends_at, lang)}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">
          {dict.table.totalColumn}
        </span>
        <span className="text-base font-bold text-foreground">
          {formatCurrency(booking.total, booking.currency, lang)}
        </span>
      </div>
    </button>
  );
}

export function BookingsTable({
  dict,
  common,
  lang,
  initialData,
}: {
  dict: BookingsDict;
  common: Dictionary["common"];
  lang: Locale;
  initialData: BookingListResponse;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState<BookingStatus | "">(
    (searchParams.get("status") as BookingStatus) || ""
  );
  const [dateFrom, setDateFrom] = useState(searchParams.get("date_from") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("date_to") || "");
  const [page, setPage] = useState(
    searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1
  );

  const initialMount = useRef(true);

  // Sync to URL whenever states change (except searchInput, we wait for debouncedSearch)
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearch) params.set("search", debouncedSearch);
    else params.delete("search");
    
    if (status) params.set("status", status);
    else params.delete("status");
    
    if (dateFrom) params.set("date_from", dateFrom);
    else params.delete("date_from");
    
    if (dateTo) params.set("date_to", dateTo);
    else params.delete("date_to");
    
    params.set("page", page.toString());
    
    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, status, dateFrom, dateTo, page, pathname, router]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (debouncedSearch !== searchInput.trim()) {
        setDebouncedSearch(searchInput.trim());
        setPage(1);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput, debouncedSearch]);

  function handleStatusChange(value: BookingStatus) {
    setStatus(value);
    setPage(1);
  }

  function handleDateRangeChange(from: string, to: string) {
    setDateFrom(from);
    setDateTo(to);
    setPage(1);
  }

  const hasFilters = !!(status || dateFrom || dateTo || debouncedSearch);
  const isDefaultQuery = !hasFilters && page === 1;

  const filterParams = useMemo(
    () => ({
      status: status || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      search: debouncedSearch || undefined,
      page,
      page_size: 20,
    }),
    [status, dateFrom, dateTo, debouncedSearch, page]
  );

  const bookingsQuery = useQuery({
    queryKey: ["braider-bookings", filterParams],
    queryFn: () => bookingsApi.list(accessToken!, lang, filterParams),
    enabled: !!accessToken,
    initialData: isDefaultQuery ? initialData : undefined,
    placeholderData: (previous) => previous,
  });

  const bookings = bookingsQuery.data?.items ?? [];
  const isLoading = bookingsQuery.isLoading || bookingsQuery.isPlaceholderData;

  const statusOptions: SelectOption<BookingStatus>[] = [
    { value: "" as BookingStatus, label: dict.filters.statusAll },
    ...(Object.keys(dict.status) as BookingStatus[]).map((value) => ({
      value,
      label: dict.status[value],
    })),
  ];

  function resetFilters() {
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setSearchInput("");
    setDebouncedSearch("");
    setPage(1);
  }

  const columns: DataTableColumn<BookingListItemResponse>[] = [
    {
      key: "style",
      header: dict.table.styleColumn,
      render: (row) => (
        <div>
          <p className="font-semibold text-foreground">{row.style_name}</p>
          <p className="text-xs text-muted-foreground">{row.reference}</p>
        </div>
      ),
    },
    {
      key: "customer",
      header: dict.table.customerColumn,
      render: (row) => row.customer_name,
    },
    {
      key: "date",
      header: dict.table.dateColumn,
      render: (row) => (
        <DateTimeCell startsAt={row.starts_at} endsAt={row.ends_at} lang={lang} />
      ),
    },
    {
      key: "status",
      header: dict.table.statusColumn,
      render: (row) => <StatusBadge status={row.status} dict={dict.status} />,
    },
    {
      key: "total",
      header: dict.table.totalColumn,
      align: "right",
      render: (row) => (
        <span className="font-bold text-foreground">
          {formatCurrency(row.total, row.currency, lang)}
        </span>
      ),
      cellClassName: "font-bold",
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <DropdownMenu
          trigger={
            <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-border text-icon-muted transition-colors">
              <MoreHorizontal className="size-4" />
            </button>
          }
        >
          <DropdownMenuItem 
            icon={<Eye className="size-4" />}
            onClick={() => router.push(`/${lang}/dashboard/bookings/${row.id}`)}
          >
            View details
          </DropdownMenuItem>
        </DropdownMenu>
      ),
    },
  ];

  const emptyState = (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <Inbox className="size-8 text-icon-muted" />
      <p className="text-sm font-semibold text-foreground">
        {hasFilters ? dict.noResults : dict.empty.title}
      </p>
      {!hasFilters && (
        <p className="max-w-xs text-xs text-muted-foreground">
          {dict.empty.description}
        </p>
      )}
    </div>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 border border-border bg-surface p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[2fr_1.5fr_1.5fr_auto] lg:items-end">
        <Input
          label={dict.filters.searchLabel}
          showLabel
          icon={Search}
          placeholder={dict.filters.searchPlaceholder}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <Select
          label={dict.filters.statusLabel}
          showLabel
          value={status}
          onChange={handleStatusChange}
          placeholder={dict.filters.statusAll}
          options={statusOptions}
        />
        <DateRangePicker
          label={dict.filters.dateRangeLabel}
          placeholder={dict.filters.dateRangePlaceholder}
          presetsLabel={dict.filters.dateRangePresets}
          todayLabel={dict.filters.dateRangeToday}
          last7DaysLabel={dict.filters.dateRangeLast7Days}
          thisMonthLabel={dict.filters.dateRangeThisMonth}
          lastMonthLabel={dict.filters.dateRangeLastMonth}
          clearLabel={dict.filters.dateRangeClear}
          applyLabel={dict.filters.dateRangeApply}
          previousMonthLabel={dict.filters.dateRangePreviousMonth}
          nextMonthLabel={dict.filters.dateRangeNextMonth}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onChange={handleDateRangeChange}
          lang={lang}
        />
        <Button
          type="button"
          variant="ghost"
          className="h-[46px] w-[46px] shrink-0 p-0 text-muted-foreground hover:bg-border/50 hover:text-foreground transition-all rounded-md flex items-center justify-center disabled:opacity-0 disabled:pointer-events-none"
          onClick={resetFilters}
          disabled={!hasFilters}
          aria-label={dict.filters.reset}
          title={dict.filters.reset}
        >
          <X className="size-5" />
        </Button>
      </div>

      <div className="mt-4 border border-border bg-surface shadow-sm">
        {bookingsQuery.isError ? (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            {dict.loadError}
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={bookings}
              getRowKey={(row) => row.id}
              renderMobileCard={(row) => (
                <BookingCard
                  booking={row}
                  lang={lang}
                  dict={dict}
                  onClick={() => router.push(`/${lang}/dashboard/bookings/${row.id}`)}
                />
              )}
              isLoading={isLoading}
              emptyState={emptyState}
            />

            {bookingsQuery.data && (
              <Pagination
                page={bookingsQuery.data.page}
                totalPages={bookingsQuery.data.total_pages}
                hasNext={bookingsQuery.data.has_next}
                hasPrevious={bookingsQuery.data.has_previous}
                onPageChange={setPage}
                disabled={isLoading}
                summary={dict.pagination.summary
                  .replace("{page}", String(bookingsQuery.data.page))
                  .replace("{totalPages}", String(bookingsQuery.data.total_pages))
                  .replace("{totalItems}", String(bookingsQuery.data.total_items))}
                previousLabel={dict.pagination.previous}
                nextLabel={dict.pagination.next}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
