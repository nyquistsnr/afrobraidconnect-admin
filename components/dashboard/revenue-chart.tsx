"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardRevenueTimeseriesResponse } from "@/lib/api/types";

interface RevenueChartProps {
  data: DashboardRevenueTimeseriesResponse;
  title: string;
}

export function RevenueChart({ data, title }: RevenueChartProps) {
  const chartData = useMemo(() => {
    return data.points.map((point) => ({
      bucket: new Date(point.bucket).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      revenue: parseFloat(point.revenue),
    }));
  }, [data]);

  const currencySymbol = data.currency === "EUR" ? "€" : data.currency;

  if (data.points.length === 0) {
    return (
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2">No revenue data available.</p>
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
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="bucket" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => `${currencySymbol}${value}`}
              dx={-10}
            />
            <Tooltip 
              formatter={(value: any) => [`${currencySymbol}${Number(value).toFixed(2)}`, "Revenue"]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              activeDot={{ r: 6 }}
              dot={{ r: 3, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
