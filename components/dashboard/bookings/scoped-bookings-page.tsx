import { BarChart3, CalendarCheck, CreditCard, RefreshCw, Scissors, TrendingUp } from "lucide-react";
import type { AdminBookingsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import { moneyFromMinor } from "@/components/dashboard/admin-commerce/formatters";
import { AdminBookingsManager } from "@/components/dashboard/bookings/admin-bookings-manager";
import { BackButton } from "@/components/ui/back-button";
import type {
  AdminBookingListItem,
  AdminBookingStats,
  AdminBookingsListParams,
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

function scopeEyebrow(scopeKind: ScopeKind) {
  if (scopeKind === "relationship") return "Relationship bookings";
  if (scopeKind === "braider") return "Braider bookings";
  return "Customer bookings";
}

function formatCount(value: number | undefined) {
  return typeof value === "number" ? new Intl.NumberFormat().format(value) : "-";
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
