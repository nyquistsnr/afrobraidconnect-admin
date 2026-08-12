"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Banknote,
  CalendarCheck,
  CreditCard,
  Filter,
  Globe2,
  RefreshCw,
  RotateCcw,
  Scissors,
  Search,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AdminDashboardDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import { moneyFromMinor } from "@/components/dashboard/admin-commerce/formatters";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import { formatCurrency, formatDateOnly } from "@/lib/format";
import type {
  AdminChartPoint,
  AdminChartResponse,
  AdminDashboardChartParams,
  AdminDashboardFilters,
  AdminDashboardFinancials,
  AdminDashboardOverview,
  AdminRevenueChartInterval,
  BookingStatus,
  Currency,
  PaymentSchedule,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

type MobileFilter = "true" | "false";
type CountryFilter = "DE" | "FR";
type CurrencyFilter = "EUR" | "GBP" | "USD";
type StyleLimit = "5" | "8" | "12" | "25";

export interface AdminDashboardCharts {
  revenue: AdminChartResponse | null;
  weekday: AdminChartResponse | null;
  status: AdminChartResponse | null;
  countries: AdminChartResponse | null;
  styles: AdminChartResponse | null;
}

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

const countryOptions: SelectOption<CountryFilter>[] = [
  { value: "DE", label: "DE" },
  { value: "FR", label: "FR" },
];

const chartColors = [
  "#b9713f",
  "#2563eb",
  "#059669",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#ca8a04",
  "#4b5563",
  "#db2777",
  "#16a34a",
];

export function AdminDashboardPage({
  lang,
  dict,
  filters,
  chartFilters,
  overview,
  financials,
  charts,
  loadError,
}: {
  lang: Locale;
  dict: AdminDashboardDict;
  filters: AdminDashboardFilters;
  chartFilters: AdminDashboardChartParams;
  overview: AdminDashboardOverview | null;
  financials: AdminDashboardFinancials | null;
  charts: AdminDashboardCharts;
  loadError: boolean;
}) {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(hasActiveFilters(filters, chartFilters));
  const currency = overview?.currency || financials?.currency || filters.currency || "EUR";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-brand">{dict.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {dict.title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {dict.subtitle}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center justify-center gap-2 border border-border bg-input px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-border/40"
          >
            <RefreshCw className="size-4" />
            {dict.refresh}
          </button>
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            className="inline-flex items-center justify-center gap-2 border border-border bg-input px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-border/40"
          >
            <Filter className="size-4" />
            {filtersOpen ? dict.hideFilters : dict.showFilters}
          </button>
        </div>
      </div>

      {loadError ? (
        <div className="border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          {dict.loadError}
        </div>
      ) : null}

      {filtersOpen ? (
        <DashboardFilterForm
          lang={lang}
          dict={dict}
          filters={filters}
          chartFilters={chartFilters}
          resetHref={`/${lang}/dashboard`}
        />
      ) : null}

      <MetricSection
        icon={CalendarCheck}
        title={dict.overviewTitle}
        subtitle={dict.overviewSubtitle}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={CalendarCheck} label={dict.overview.totalBookings} value={formatCount(overview?.total_bookings)} />
          <MetricCard icon={Scissors} label={dict.overview.completed} value={formatCount(overview?.completed_count)} />
          <MetricCard icon={CreditCard} label={dict.overview.netPaid} value={moneyFromMinor(overview?.net_amount_minor, currency, lang)} />
          <MetricCard icon={TrendingUp} label={dict.overview.bookingValue} value={moneyFromMinor(overview?.total_booking_value_minor, currency, lang)} />
          <MetricCard icon={WalletCards} label={dict.overview.paid} value={moneyFromMinor(overview?.paid_amount_minor, currency, lang)} />
          <MetricCard icon={RefreshCw} label={dict.overview.refunded} value={moneyFromMinor(overview?.refunded_amount_minor, currency, lang)} />
          <MetricCard icon={Banknote} label={dict.overview.pendingAmount} value={moneyFromMinor(overview?.pending_payment_amount_minor, currency, lang)} />
          <MetricCard icon={CreditCard} label={dict.overview.braiderEarnings} value={moneyFromMinor(overview?.braider_earnings_minor, currency, lang)} />
          <MetricCard icon={Users} label={dict.overview.uniqueCustomers} value={formatCount(firstNumber(overview?.unique_customer_count, overview?.unique_counterpart_count))} />
          <MetricCard icon={Users} label={dict.overview.repeatCustomers} value={formatCount(firstNumber(overview?.repeat_customer_count, overview?.repeat_counterpart_count))} />
          <MetricCard icon={Scissors} label={dict.overview.uniqueBraiders} value={formatCount(firstNumber(overview?.unique_braider_count))} />
          <MetricCard icon={Scissors} label={dict.overview.repeatBraiders} value={formatCount(firstNumber(overview?.repeat_braider_count))} />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
          <SplitPanel
            mobileLabel={dict.overview.mobile}
            mobileValue={firstNumber(overview?.mobile_count)}
            salonLabel={dict.overview.salon}
            salonValue={firstNumber(overview?.salon_count)}
          />
          <StatusBreakdown dict={dict} overview={overview} />
        </div>
      </MetricSection>

      <MetricSection
        icon={Banknote}
        title={dict.financialsTitle}
        subtitle={dict.financialsSubtitle}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={Scissors} label={dict.financials.serviceSubtotal} value={moneyFromMinor(financials?.service_subtotal_minor, currency, lang)} />
          <MetricCard icon={CreditCard} label={dict.financials.platformFee} value={moneyFromMinor(financials?.platform_fee_total_minor, currency, lang)} />
          <MetricCard icon={Banknote} label={dict.financials.vatTotal} value={moneyFromMinor(financials?.vat_total_minor, currency, lang)} />
          <MetricCard icon={TrendingUp} label={dict.financials.grossBookingValue} value={moneyFromMinor(financials?.gross_booking_value_minor ?? financials?.total_booking_value_minor, currency, lang)} />
          <MetricCard icon={WalletCards} label={dict.financials.paid} value={moneyFromMinor(financials?.paid_amount_minor, currency, lang)} />
          <MetricCard icon={RefreshCw} label={dict.financials.refunded} value={moneyFromMinor(financials?.refunded_amount_minor, currency, lang)} />
          <MetricCard icon={CreditCard} label={dict.financials.netPaid} value={moneyFromMinor(financials?.net_amount_minor, currency, lang)} />
          <MetricCard icon={Banknote} label={dict.financials.pendingPayment} value={moneyFromMinor(financials?.pending_payment_amount_minor, currency, lang)} />
          <MetricCard icon={Scissors} label={dict.financials.braiderEarnings} value={moneyFromMinor(financials?.braider_earnings_minor, currency, lang)} />
          <MetricCard icon={TrendingUp} label={dict.financials.grossMarginBeforeTax} value={moneyFromMinor(financials?.gross_margin_before_tax_minor, currency, lang)} />
          <MetricCard icon={Banknote} label={dict.financials.estimatedProfitAfterVat} value={moneyFromMinor(financials?.estimated_profit_after_vat_minor, currency, lang)} />
        </div>
      </MetricSection>

      <MetricSection
        icon={TrendingUp}
        title={dict.chartsTitle}
        subtitle={dict.chartsSubtitle}
      >
        <DashboardCharts
          lang={lang}
          dict={dict}
          charts={charts}
          currency={chartCurrency(charts) || currency}
        />
      </MetricSection>
    </div>
  );
}

function DashboardFilterForm({
  lang,
  dict,
  filters,
  chartFilters,
  resetHref,
}: {
  lang: Locale;
  dict: AdminDashboardDict;
  filters: AdminDashboardFilters;
  chartFilters: AdminDashboardChartParams;
  resetHref: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(filters.search ?? "");
  const [status, setStatus] = useState<BookingStatus | "">(filters.status ?? "");
  const [appointmentFrom, setAppointmentFrom] = useState(filters.date_from ?? "");
  const [appointmentTo, setAppointmentTo] = useState(filters.date_to ?? "");
  const [createdFrom, setCreatedFrom] = useState(filters.created_from ?? "");
  const [createdTo, setCreatedTo] = useState(filters.created_to ?? "");
  const [paymentFrom, setPaymentFrom] = useState(filters.payment_date_from ?? "");
  const [paymentTo, setPaymentTo] = useState(filters.payment_date_to ?? "");
  const [country, setCountry] = useState<CountryFilter | "">(
    filters.country === "DE" || filters.country === "FR" ? filters.country : ""
  );
  const [currency, setCurrency] = useState<CurrencyFilter | "">(
    filters.currency === "EUR" || filters.currency === "GBP" || filters.currency === "USD"
      ? filters.currency
      : ""
  );
  const [isMobile, setIsMobile] = useState<MobileFilter | "">(
    filters.is_mobile === undefined ? "" : (String(filters.is_mobile) as MobileFilter)
  );
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule | "">(
    filters.payment_schedule ?? ""
  );
  const [interval, setInterval] = useState<AdminRevenueChartInterval>(
    chartFilters.interval ?? "month"
  );
  const [limit, setLimit] = useState<StyleLimit>(
    chartFilters.limit === 5 || chartFilters.limit === 12 || chartFilters.limit === 25
      ? String(chartFilters.limit) as StyleLimit
      : "8"
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
  const intervalOptions: SelectOption<AdminRevenueChartInterval>[] = [
    { value: "day", label: dict.filters.day },
    { value: "week", label: dict.filters.week },
    { value: "month", label: dict.filters.month },
  ];
  const limitOptions: SelectOption<StyleLimit>[] = [
    { value: "5", label: "5" },
    { value: "8", label: "8" },
    { value: "12", label: "12" },
    { value: "25", label: "25" },
  ];

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);
    if (appointmentFrom) params.set("date_from", appointmentFrom);
    if (appointmentTo) params.set("date_to", appointmentTo);
    if (createdFrom) params.set("created_from", createdFrom);
    if (createdTo) params.set("created_to", createdTo);
    if (paymentFrom) params.set("payment_date_from", paymentFrom);
    if (paymentTo) params.set("payment_date_to", paymentTo);
    if (country) params.set("country", country);
    if (currency) params.set("currency", currency);
    if (isMobile) params.set("is_mobile", String(isMobile === "true"));
    if (paymentSchedule) params.set("payment_schedule", paymentSchedule);
    if (interval !== "month") params.set("interval", interval);
    if (limit !== "8") params.set("limit", limit);

    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
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
          {...datePickerLabels(dict, lang)}
        />
        <DateRangePicker
          label={dict.filters.createdRange}
          dateFrom={createdFrom}
          dateTo={createdTo}
          onChange={(from, to) => {
            setCreatedFrom(from);
            setCreatedTo(to);
          }}
          {...datePickerLabels(dict, lang)}
        />
        <DateRangePicker
          label={dict.filters.paymentRange}
          dateFrom={paymentFrom}
          dateTo={paymentTo}
          onChange={(from, to) => {
            setPaymentFrom(from);
            setPaymentTo(to);
          }}
          {...datePickerLabels(dict, lang)}
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
        <Select
          label={dict.filters.interval}
          showLabel
          value={interval}
          onChange={setInterval}
          options={intervalOptions}
        />
        <Select
          label={dict.filters.styleLimit}
          showLabel
          value={limit}
          onChange={setLimit}
          options={limitOptions}
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

function MetricSection({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-border bg-surface shadow-sm">
      <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
        <div className="mt-0.5 bg-brand/10 p-2 text-brand">
          <Icon className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-border bg-background p-4">
      <div className="flex items-center gap-3">
        <div className="bg-brand/10 p-2 text-brand">
          <Icon className="size-4" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-4 break-words text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function SplitPanel({
  mobileLabel,
  mobileValue,
  salonLabel,
  salonValue,
}: {
  mobileLabel: string;
  mobileValue: number;
  salonLabel: string;
  salonValue: number;
}) {
  const total = mobileValue + salonValue;
  const mobilePct = total > 0 ? Math.round((mobileValue / total) * 100) : 0;
  const salonPct = total > 0 ? 100 - mobilePct : 0;

  return (
    <div className="border border-border bg-background p-4">
      <div className="flex items-center gap-3">
        <div className="bg-brand/10 p-2 text-brand">
          <Globe2 className="size-4" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {mobileLabel} / {salonLabel}
        </p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SplitValue label={mobileLabel} value={mobileValue} percentage={mobilePct} />
        <SplitValue label={salonLabel} value={salonValue} percentage={salonPct} />
      </div>
      <div className="mt-4 flex h-2 overflow-hidden bg-border">
        <div className="bg-brand" style={{ width: `${mobilePct}%` }} />
        <div className="bg-blue-600" style={{ width: `${salonPct}%` }} />
      </div>
    </div>
  );
}

function SplitValue({
  label,
  value,
  percentage,
}: {
  label: string;
  value: number;
  percentage: number;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">{formatCount(value)}</p>
      <p className="mt-1 text-xs text-muted-foreground">{percentage}%</p>
    </div>
  );
}

function StatusBreakdown({
  dict,
  overview,
}: {
  dict: AdminDashboardDict;
  overview: AdminDashboardOverview | null;
}) {
  const counts = overview?.counts_by_status || overview?.per_status_counts || {};
  const rows = bookingStatuses
    .map((status) => ({ status, value: firstNumber(counts[status]) }))
    .filter((row) => row.value > 0);

  return (
    <div className="border border-border bg-background p-4">
      <div className="flex items-center gap-3">
        <div className="bg-brand/10 p-2 text-brand">
          <BarChartIcon className="size-4" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {dict.overview.statusBreakdown}
        </p>
      </div>
      <div className="mt-4 space-y-3">
        {rows.length ? (
          rows.map((row, index) => (
            <div key={row.status}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-muted-foreground">{dict.statusLabels[row.status]}</span>
                <span className="font-semibold text-foreground">{formatCount(row.value)}</span>
              </div>
              <div className="mt-1 h-1.5 bg-border">
                <div
                  className="h-full"
                  style={{
                    width: `${statusWidth(row.value, rows)}%`,
                    backgroundColor: chartColors[index % chartColors.length],
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">-</p>
        )}
      </div>
    </div>
  );
}

function DashboardCharts({
  lang,
  dict,
  charts,
  currency,
}: {
  lang: Locale;
  dict: AdminDashboardDict;
  charts: AdminDashboardCharts;
  currency: Currency;
}) {
  const revenue = chartPoints(charts.revenue).map((point) => ({
    name: labelForPoint(point, "revenue", lang, dict),
    value: moneyValue(point),
  }));
  const weekday = chartPoints(charts.weekday).map((point) => ({
    name: labelForPoint(point, "weekday", lang, dict),
    value: countValue(point),
  }));
  const status = chartPoints(charts.status).map((point) => ({
    name: labelForPoint(point, "status", lang, dict),
    value: countValue(point),
  }));
  const countries = chartPoints(charts.countries).map((point) => ({
    name: labelForPoint(point, "countries", lang, dict),
    value: countValue(point),
  }));
  const styles = chartPoints(charts.styles).map((point) => ({
    name: labelForPoint(point, "styles", lang, dict),
    value: countValue(point) || moneyValue(point),
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartPanel title={dict.charts.revenue} empty={!revenue.length} emptyLabel={dict.noChartData}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenue} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} minTickGap={16} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={68} tickFormatter={(value) => shortMoney(value, currency, lang)} />
            <Tooltip formatter={(value) => formatCurrency(Number(value), currency, lang)} contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="value" stroke={chartColors[0]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>

      <BarPanel title={dict.charts.weekday} data={weekday} emptyLabel={dict.noChartData} color={chartColors[1]} />
      <BarPanel title={dict.charts.status} data={status} emptyLabel={dict.noChartData} multiColor />
      <BarPanel title={dict.charts.countries} data={countries} emptyLabel={dict.noChartData} color={chartColors[5]} />

      <ChartPanel title={dict.charts.styles} empty={!styles.length} emptyLabel={dict.noChartData}>
        <div className="grid h-full min-h-64 gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={styles} dataKey="value" nameKey="name" innerRadius={48} outerRadius={86} paddingAngle={2}>
                {styles.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col justify-center gap-2 text-sm">
            {styles.slice(0, 10).map((entry, index) => (
              <div key={`${entry.name}-${index}`} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="size-2.5 shrink-0" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                  <span className="truncate text-muted-foreground">{entry.name}</span>
                </span>
                <span className="font-semibold text-foreground">{formatCount(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </ChartPanel>
    </div>
  );
}

function BarPanel({
  title,
  data,
  emptyLabel,
  color = chartColors[0],
  multiColor = false,
}: {
  title: string;
  data: { name: string; value: number }[];
  emptyLabel: string;
  color?: string;
  multiColor?: boolean;
}) {
  return (
    <ChartPanel title={title} empty={!data.length} emptyLabel={emptyLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} minTickGap={12} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={40} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]}>
            {multiColor
              ? data.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={chartColors[index % chartColors.length]} />
                ))
              : null}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}

function ChartPanel({
  title,
  empty,
  emptyLabel,
  children,
}: {
  title: string;
  empty: boolean;
  emptyLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-border bg-background p-4">
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <div className="mt-3 h-72">
        {empty ? (
          <div className="flex h-full items-center justify-center border border-dashed border-border px-4 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function datePickerLabels(dict: AdminDashboardDict, lang: Locale) {
  return {
    placeholder: dict.filters.dateRangePlaceholder,
    presetsLabel: dict.filters.presets,
    todayLabel: dict.filters.today,
    last7DaysLabel: dict.filters.last7Days,
    thisMonthLabel: dict.filters.thisMonth,
    lastMonthLabel: dict.filters.lastMonth,
    clearLabel: dict.filters.clear,
    applyLabel: dict.filters.applyRange,
    previousMonthLabel: dict.filters.previousMonth,
    nextMonthLabel: dict.filters.nextMonth,
    lang,
  };
}

function hasActiveFilters(
  filters: AdminDashboardFilters,
  chartFilters: AdminDashboardChartParams
) {
  return Boolean(
    filters.search ||
      filters.status ||
      filters.date_from ||
      filters.date_to ||
      filters.created_from ||
      filters.created_to ||
      filters.payment_date_from ||
      filters.payment_date_to ||
      filters.country ||
      filters.currency ||
      filters.is_mobile !== undefined ||
      filters.payment_schedule ||
      chartFilters.interval !== "month" ||
      chartFilters.limit !== 8
  );
}

function chartPoints(chart: AdminChartResponse | AdminChartPoint[] | null): AdminChartPoint[] {
  if (!chart) return [];
  if (Array.isArray(chart)) return chart;
  if (Array.isArray(chart.items)) return chart.items;
  if (Array.isArray(chart.points)) return chart.points;
  if (Array.isArray(chart.data)) return chart.data;
  return [];
}

function chartCurrency(charts: AdminDashboardCharts): Currency | null {
  return (
    charts.revenue?.currency ||
    charts.weekday?.currency ||
    charts.status?.currency ||
    charts.countries?.currency ||
    charts.styles?.currency ||
    null
  );
}

function labelForPoint(
  point: AdminChartPoint,
  chart: "revenue" | "weekday" | "status" | "countries" | "styles",
  lang: Locale,
  dict: AdminDashboardDict
) {
  if (chart === "weekday" && point.weekday !== null && point.weekday !== undefined) {
    const weekday = Number(point.weekday);
    if (weekday >= 1 && weekday <= 7) {
      return dict.weekdays[weekday as 1 | 2 | 3 | 4 | 5 | 6 | 7];
    }
  }

  const status = point.status ? String(point.status).toUpperCase() : "";
  if (chart === "status" && bookingStatuses.includes(status as BookingStatus)) {
    return dict.statusLabels[status as BookingStatus];
  }

  const raw =
    point.label ??
    point.name ??
    point.period ??
    point.date ??
    point.style_name ??
    point.country ??
    point.period_start ??
    "-";
  const label = String(raw);

  if (chart === "countries" && /^[A-Z]{2}$/i.test(label)) {
    return countryName(label.toUpperCase(), lang);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    return formatDateOnly(label, lang);
  }

  return label
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function countryName(countryCode: string, lang: Locale) {
  try {
    const displayNames = new Intl.DisplayNames([lang], { type: "region" });
    return displayNames.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
}

function countValue(point: AdminChartPoint) {
  return firstNumber(point.count, point.value, point.total, point.bookings_count);
}

function moneyValue(point: AdminChartPoint) {
  const minor = firstNumber(
    point.amount_minor,
    point.value_minor,
    point.revenue_minor,
    point.earnings_minor,
    point.spend_minor,
    point.total_amount_minor
  );
  if (minor) return minor / 100;
  return firstNumber(point.amount, point.value, point.revenue, point.total);
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) return numberValue;
  }
  return 0;
}

function formatCount(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";
  return new Intl.NumberFormat().format(numeric);
}

function shortMoney(value: number | string, currency: Currency, lang: Locale) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";
  if (Math.abs(numeric) >= 1000) {
    return `${formatCurrency(numeric / 1000, currency, lang).replace(/\s?0+([,.]0+)?$/, "")}k`;
  }
  return formatCurrency(numeric, currency, lang);
}

function statusWidth(value: number, rows: { value: number }[]) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return Math.max(4, Math.round((value / max) * 100));
}

function BarChartIcon({ className }: { className?: string }) {
  return <TrendingUp className={className} />;
}

const tooltipStyle = {
  border: "1px solid hsl(var(--border))",
  borderRadius: 4,
  background: "hsl(var(--background))",
  color: "hsl(var(--foreground))",
};
