"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Locale } from "@/lib/i18n";
import { X } from "lucide-react";

interface DashboardFiltersProps {
  lang: Locale;
  dict: any; // dict.dashboard.bookings.filters
}

export function DashboardFilters({ lang, dict }: DashboardFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [dateFrom, setDateFrom] = useState(searchParams.get("date_from") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("date_to") || "");

  function handleDateRangeChange(from: string, to: string) {
    setDateFrom(from);
    setDateTo(to);
    
    const params = new URLSearchParams(searchParams.toString());
    if (from) params.set("date_from", from);
    else params.delete("date_from");
    
    if (to) params.set("date_to", to);
    else params.delete("date_to");
    
    router.push(`${pathname}?${params.toString()}`);
  }

  function resetFilters() {
    setDateFrom("");
    setDateTo("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("date_from");
    params.delete("date_to");
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilters = !!(dateFrom || dateTo);

  return (
    <div className="flex w-full items-end gap-3 sm:w-auto">
      <div className="min-w-0 flex-1 sm:flex-initial">
        <DateRangePicker
          label={dict.dateRangeLabel}
          placeholder={dict.dateRangePlaceholder}
          presetsLabel={dict.dateRangePresets}
          todayLabel={dict.dateRangeToday}
          last7DaysLabel={dict.dateRangeLast7Days}
          thisMonthLabel={dict.dateRangeThisMonth}
          lastMonthLabel={dict.dateRangeLastMonth}
          clearLabel={dict.dateRangeClear}
          applyLabel={dict.dateRangeApply}
          previousMonthLabel={dict.dateRangePreviousMonth}
          nextMonthLabel={dict.dateRangeNextMonth}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onChange={handleDateRangeChange}
          lang={lang}
        />
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="mb-[2px] flex h-[38px] shrink-0 items-center justify-center rounded-lg border border-border bg-background px-3 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
          aria-label={dict.reset}
          title={dict.reset}
        >
          <X className="mr-1.5 size-3.5" />
          <span className="hidden sm:inline">{dict.reset || "Clear"}</span>
          <span className="sm:hidden">Clear</span>
        </button>
      )}
    </div>
  );
}
