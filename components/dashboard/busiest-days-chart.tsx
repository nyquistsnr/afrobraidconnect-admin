"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardBookingsByWeekdayResponse } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

interface BusiestDaysChartProps {
  data: DashboardBookingsByWeekdayResponse;
  title: string;
  lang: Locale;
}

export function BusiestDaysChart({ data, title, lang }: BusiestDaysChartProps) {
  const chartData = useMemo(() => {
    // 1=Monday ... 7=Sunday
    const getDayName = (weekday: number) => {
      const date = new Date(2024, 0, weekday); // Jan 1 2024 is Monday
      return date.toLocaleDateString(lang, { weekday: "short" });
    };

    return data.points.map((point) => ({
      name: getDayName(point.weekday),
      bookings: point.bookings_count,
    }));
  }, [data, lang]);

  if (data.points.every(p => p.bookings_count === 0)) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2">No data yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
