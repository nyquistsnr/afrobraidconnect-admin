"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { BookingTimeseriesResponse, BookingStatus } from "@/lib/api/types";

interface BookingTrendChartProps {
  data: BookingTimeseriesResponse;
  title?: string;
  subtitle?: string;
  emptyText?: string;
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "#10b981", // Emerald 500
  CONFIRMED: "#3b82f6", // Blue 500
  IN_PROGRESS: "#f59e0b", // Amber 500
  PENDING_PAYMENT: "#6366f1", // Indigo 500
  NO_SHOW: "#ef4444", // Red 500
  CANCELLED_BY_CUSTOMER: "#f97316", // Orange 500
  CANCELLED_BY_BRAIDER: "#ec4899", // Pink 500
  CANCELLED_NO_PAYMENT: "#8b5cf6", // Violet 500
  EXPIRED: "#94a3b8", // Slate 400
  DISPUTED: "#eab308", // Yellow 500
};

export function BookingTrendChart({ data, title = "Booking Trends", subtitle, emptyText = "No booking data available for this period." }: BookingTrendChartProps) {
  // Flatten data for recharts
  const chartData = useMemo(() => {
    return data.points.map((point) => {
      const flattenedPoint: Record<string, any> = { bucket: new Date(point.bucket).toLocaleDateString() };
      
      data.statuses.forEach((status) => {
        flattenedPoint[status] = point.counts[status] || 0;
      });
      
      return flattenedPoint;
    });
  }, [data]);

  if (data.points.length === 0) {
    return (
      <div className="hidden md:flex rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex-col items-center justify-center min-h-[400px]">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="hidden md:block rounded-xl border bg-card text-card-foreground shadow-sm p-6 mb-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
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
              allowDecimals={false}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            {data.statuses.map((status) => (
              <Line
                key={status}
                type="monotone"
                dataKey={status}
                name={status.replace(/_/g, ' ')}
                stroke={STATUS_COLORS[status] || "#94a3b8"}
                strokeWidth={3}
                activeDot={{ r: 6 }}
                dot={{ r: 3, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
