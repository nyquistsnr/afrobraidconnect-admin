"use client";

import type { ReactNode } from "react";
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
import type { AdminBookingsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import type { AdminChartPoint, AdminChartResponse, Currency } from "@/lib/api/types";
import { formatCurrency, formatDateOnly } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

export interface ScopedChartsData {
  revenue: AdminChartResponse | null;
  weekday: AdminChartResponse | null;
  status: AdminChartResponse | null;
  styles: AdminChartResponse | null;
}

const CHART_COLORS = [
  "#b9713f",
  "#2563eb",
  "#059669",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#ca8a04",
  "#4b5563",
];

export function ScopedBookingCharts({
  charts,
  dict,
  lang,
  currency,
}: {
  charts: ScopedChartsData;
  dict: AdminBookingsDict;
  lang: Locale;
  currency?: Currency | null;
}) {
  const resolvedCurrency = currency || chartCurrency(charts) || "EUR";
  const revenue = chartPoints(charts.revenue).map((point) => ({
    name: labelForPoint(point, lang),
    value: moneyValue(point),
  }));
  const weekday = chartPoints(charts.weekday).map((point) => ({
    name: labelForPoint(point, lang),
    value: countValue(point),
  }));
  const status = chartPoints(charts.status).map((point) => ({
    name: labelForPoint(point, lang),
    value: countValue(point),
  }));
  const styles = chartPoints(charts.styles).map((point) => ({
    name: labelForPoint(point, lang),
    value: countValue(point),
  }));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartPanel title={dict.scoped.revenueChart} empty={!revenue.length} emptyLabel={dict.scoped.noChartData}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenue} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              width={68}
              tickFormatter={(value) => shortMoney(value, resolvedCurrency, lang)}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value), resolvedCurrency, lang)}
              labelClassName="text-foreground"
              contentStyle={tooltipStyle}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={CHART_COLORS[0]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title={dict.scoped.weekdayChart} empty={!weekday.length} emptyLabel={dict.scoped.noChartData}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekday} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={40} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill={CHART_COLORS[1]} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title={dict.scoped.statusChart} empty={!status.length} emptyLabel={dict.scoped.noChartData}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={status} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={40} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {status.map((entry, index) => (
                <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title={dict.scoped.stylesChart} empty={!styles.length} emptyLabel={dict.scoped.noChartData}>
        <div className="grid h-full min-h-64 gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={styles} dataKey="value" nameKey="name" innerRadius={54} outerRadius={88} paddingAngle={2}>
                {styles.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col justify-center gap-2 text-sm">
            {styles.slice(0, 8).map((entry, index) => (
              <div key={`${entry.name}-${index}`} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="truncate text-muted-foreground">{entry.name}</span>
                </span>
                <span className="font-semibold text-foreground">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </ChartPanel>
    </div>
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
      <div className="mt-3 h-64">
        {empty ? (
          <div className="flex h-full items-center justify-center border border-dashed border-border text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function chartPoints(chart: AdminChartResponse | AdminChartPoint[] | null): AdminChartPoint[] {
  if (!chart) return [];
  if (Array.isArray(chart)) return chart;
  if (Array.isArray(chart.items)) return chart.items;
  if (Array.isArray(chart.points)) return chart.points;
  if (Array.isArray(chart.data)) return chart.data;
  if (Array.isArray(chart.slices)) return chart.slices;
  return [];
}

function chartCurrency(charts: ScopedChartsData): Currency | null {
  return (
    charts.revenue?.currency ||
    charts.weekday?.currency ||
    charts.status?.currency ||
    charts.styles?.currency ||
    null
  );
}

function labelForPoint(point: AdminChartPoint, lang: Locale) {
  const raw =
    point.label ??
    point.name ??
    point.period ??
    point.date ??
    point.weekday ??
    point.status ??
    point.style_name ??
    point.period_start ??
    "-";
  const label = String(raw);

  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    return formatDateOnly(label, lang);
  }

  return label
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
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

function shortMoney(value: number | string, currency: Currency, lang: Locale) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";
  if (Math.abs(numeric) >= 1000) {
    return formatCurrency(numeric / 1000, currency, lang).replace(/\s?0+([,.]0+)?$/, "") + "k";
  }
  return formatCurrency(numeric, currency, lang);
}

const tooltipStyle = {
  border: "1px solid hsl(var(--border))",
  borderRadius: 4,
  background: "hsl(var(--background))",
  color: "hsl(var(--foreground))",
};
