import Link from "next/link";
import type { BookingListResponse, BookingStatus } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

interface RecentBookingsTableProps {
  data: BookingListResponse;
  title: string;
  viewAllText: string;
  lang: Locale;
  statusMap: Record<string, string>;
}

export function RecentBookingsTable({ data, title, viewAllText, lang, statusMap }: RecentBookingsTableProps) {
  const getStatusVariant = (status: BookingStatus) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "CONFIRMED":
      case "IN_PROGRESS":
        return "default";
      case "PENDING_PAYMENT":
        return "warning";
      case "CANCELLED_BY_CUSTOMER":
      case "CANCELLED_BY_BRAIDER":
      case "CANCELLED_NO_PAYMENT":
      case "NO_SHOW":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <div className="flex-1">
        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Client</th>
                <th className="px-6 py-3 text-left font-medium">Style</th>
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No recent bookings.
                  </td>
                </tr>
              ) : (
                data.items.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{booking.customer_name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{booking.style_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(booking.starts_at))}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={getStatusVariant(booking.status) as any}>
                        {statusMap[booking.status] || booking.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {new Intl.NumberFormat(lang, { style: "currency", currency: booking.currency }).format(parseFloat(booking.total))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block sm:hidden divide-y divide-border">
          {data.items.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              No recent bookings.
            </div>
          ) : (
            data.items.map((booking) => (
              <div key={booking.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm">{booking.customer_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{booking.style_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {new Intl.NumberFormat(lang, { style: "currency", currency: booking.currency }).format(parseFloat(booking.total))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(booking.starts_at))}
                  </div>
                  <Badge tone={getStatusVariant(booking.status) as any}>
                    {statusMap[booking.status] || booking.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="p-4 border-t border-border bg-muted/20">
        <Link
          href={`/${lang}/dashboard/bookings`}
          className="flex items-center justify-center text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
        >
          {viewAllText}
          <ChevronRight className="ml-1 size-4" />
        </Link>
      </div>
    </div>
  );
}
