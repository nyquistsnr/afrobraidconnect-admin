import {
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  CircleDashed,
  CreditCard,
  RefreshCw,
  Scissors,
  TrendingUp,
} from "lucide-react";
import type { AdminBookingsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import {
  compactDateTime,
  moneyFromMinor,
} from "@/components/dashboard/admin-commerce/formatters";
import { AdminBookingsManager } from "@/components/dashboard/bookings/admin-bookings-manager";
import {
  ScopedBookingCharts,
  type ScopedChartsData,
} from "@/components/dashboard/bookings/scoped-booking-charts";
import { BackButton } from "@/components/ui/back-button";
import type {
  AdminBookingListItem,
  AdminBookingStats,
  AdminBookingsListParams,
  AdminBraiderOnboarding,
  PaginationMeta,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

type ScopeKind = "braider" | "customer" | "relationship";

export function ScopedBookingsPage({
  lang,
  dict,
  scopeKind,
  title,
  subtitle,
  stats,
  statsLoadError,
  onboarding,
  onboardingLoadError,
  charts,
  chartsLoadError,
  bookings,
  pagination,
  filters,
  initialLoadError,
}: {
  lang: Locale;
  dict: AdminBookingsDict;
  scopeKind: ScopeKind;
  title: string;
  subtitle: string;
  stats: AdminBookingStats | null;
  statsLoadError: boolean;
  onboarding: AdminBraiderOnboarding | null;
  onboardingLoadError: boolean;
  charts: ScopedChartsData;
  chartsLoadError: boolean;
  bookings: AdminBookingListItem[];
  pagination: PaginationMeta;
  filters: AdminBookingsListParams;
  initialLoadError: boolean;
}) {
  const scopedDict: AdminBookingsDict = {
    ...dict,
    eyebrow: scopeEyebrow(scopeKind),
    title,
    subtitle,
    listTitle: dict.scoped.listTitle,
    listSubtitle: dict.scoped.listSubtitle,
  };

  return (
    <div className="space-y-6">
      <BackButton label={lang === "fr" ? "Retour" : lang === "de" ? "Zurück" : "Back"} />
      {scopeKind !== "customer" ? (
        <OnboardingSection
          dict={dict}
          lang={lang}
          onboarding={onboarding}
          onboardingLoadError={onboardingLoadError}
        />
      ) : null}

      <section className="border border-border bg-surface shadow-sm">
        <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="mt-0.5 bg-brand/10 p-2 text-brand">
            <BarChart3 className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              {dict.scoped.statsTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dict.scoped.statsSubtitle}
            </p>
          </div>
        </div>

        {statsLoadError ? (
          <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {dict.scoped.statsLoadError}
          </div>
        ) : null}

        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={CalendarCheck}
            label={dict.scoped.totalBookings}
            value={formatCount(stats?.total_bookings)}
          />
          <StatCard
            icon={Scissors}
            label={dict.scoped.completed}
            value={formatCount(stats?.completed_count)}
          />
          <StatCard
            icon={CreditCard}
            label={dict.scoped.netAmount}
            value={moneyFromMinor(stats?.net_amount_minor, stats?.currency || "EUR", lang)}
          />
          <StatCard
            icon={TrendingUp}
            label={dict.scoped.averageValue}
            value={moneyFromMinor(stats?.average_booking_value_minor, stats?.currency || "EUR", lang)}
          />
          <StatCard
            icon={RefreshCw}
            label={dict.scoped.refunded}
            value={moneyFromMinor(stats?.refunded_amount_minor, stats?.currency || "EUR", lang)}
          />
          <StatCard
            icon={CreditCard}
            label={scopeKind === "customer" ? dict.scoped.customerSpend : dict.scoped.braiderEarnings}
            value={moneyFromMinor(
              scopeKind === "customer"
                ? stats?.customer_spend_minor
                : stats?.braider_earnings_minor,
              stats?.currency || "EUR",
              lang
            )}
          />
          <StatCard
            icon={CalendarCheck}
            label={dict.scoped.pending}
            value={formatCount(stats?.pending_count)}
          />
          <StatCard
            icon={CalendarCheck}
            label={dict.scoped.disputed}
            value={formatCount(stats?.disputed_count)}
          />
        </div>
      </section>

      <section className="border border-border bg-surface shadow-sm">
        <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="mt-0.5 bg-brand/10 p-2 text-brand">
            <BarChart3 className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              {dict.scoped.chartsTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dict.scoped.chartsSubtitle}
            </p>
          </div>
        </div>

        {chartsLoadError ? (
          <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {dict.scoped.chartsLoadError}
          </div>
        ) : null}

        <div className="p-4">
          <ScopedBookingCharts
            charts={charts}
            dict={dict}
            lang={lang}
            currency={stats?.currency || filters.currency || "EUR"}
          />
        </div>
      </section>

      <AdminBookingsManager
        lang={lang}
        dict={scopedDict}
        bookings={bookings}
        pagination={pagination}
        filters={filters}
        initialLoadError={initialLoadError}
      />
    </div>
  );
}

const onboardingSteps = [
  "BUSINESS_INFO",
  "PHONE_VERIFICATION",
  "VERIFF",
  "SERVICE_TYPE",
  "PORTFOLIO",
  "SERVICE_LOCATION",
  "AVAILABILITY",
  "PAYMENT_SETUP",
] as const;

function OnboardingSection({
  dict,
  lang,
  onboarding,
  onboardingLoadError,
}: {
  dict: AdminBookingsDict;
  lang: Locale;
  onboarding: AdminBraiderOnboarding | null;
  onboardingLoadError: boolean;
}) {
  const stepMap = new Map(
    onboarding?.steps?.map((step) => [step.step, step]) ?? []
  );

  return (
    <section className="border border-border bg-surface shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 bg-brand/10 p-2 text-brand">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              {dict.scoped.onboardingTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dict.scoped.onboardingSubtitle}
            </p>
          </div>
        </div>
        <div className="grid gap-2 text-sm sm:min-w-64">
          <SummaryLine
            label={dict.scoped.currentStep}
            value={formatStepLabel(onboarding?.current_step)}
          />
          <SummaryLine
            label={dict.scoped.overallCompleted}
            value={compactDateTime(onboarding?.completed_at, lang)}
          />
        </div>
      </div>

      {onboardingLoadError ? (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          {dict.scoped.onboardingLoadError}
        </div>
      ) : null}

      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {onboardingSteps.map((stepName) => {
          const step = stepMap.get(stepName);
          const completed = Boolean(step?.completed);

          return (
            <div key={stepName} className="border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">
                  {formatStepLabel(stepName)}
                </p>
                {completed ? (
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                ) : (
                  <CircleDashed className="size-5 shrink-0 text-muted-foreground" />
                )}
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {completed ? dict.scoped.completed : dict.scoped.pending}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {compactDateTime(step?.completed_at, lang)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border border-border bg-background px-3 py-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

function scopeEyebrow(scopeKind: ScopeKind) {
  if (scopeKind === "relationship") return "Relationship bookings";
  if (scopeKind === "braider") return "Braider bookings";
  return "Customer bookings";
}

function formatCount(value: number | undefined) {
  return typeof value === "number" ? new Intl.NumberFormat().format(value) : "-";
}

function formatStepLabel(value: string | null | undefined) {
  if (!value) return "-";
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BarChart3;
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
