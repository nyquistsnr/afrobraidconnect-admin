import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { Locale } from "@/lib/i18n";
import { auth } from "@/auth";
import { dashboardApi } from "@/lib/api/dashboard-client";
import { bookingsApi } from "@/lib/api/bookings-client";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { BusiestDaysChart } from "@/components/dashboard/busiest-days-chart";
import { TopStylesChart } from "@/components/dashboard/top-styles-chart";
import { RecentBookingsTable } from "@/components/dashboard/recent-bookings-table";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { CalendarCheck, DollarSign, Activity, Users } from "lucide-react";

export default async function DashboardPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ date_from?: string; date_to?: string }>;
}) {
  const { lang } = await props.params;
  const searchParams = await props.searchParams;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
    redirect(`/${lang}/login`);
  }

  const dict = await getDictionary(lang);
  const homeDict = dict.dashboard.home as any;
  
  // Default to past 90 days if no date filter is applied
  let dateFrom = searchParams.date_from;
  let dateTo = searchParams.date_to;

  if (!dateFrom || !dateTo) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 90);
    dateFrom = start.toISOString().split('T')[0];
    dateTo = end.toISOString().split('T')[0];
  }

  // Fetch all dashboard data concurrently
  const [
    overviewRes,
    revenueTimeseriesRes,
    bookingsByWeekdayRes,
    styleBreakdownRes,
    recentBookingsRes,
  ] = await Promise.all([
    dashboardApi.getOverview(session.accessToken, lang, {
      date_from: dateFrom,
      date_to: dateTo,
    }),
    dashboardApi.getRevenueTimeseries(session.accessToken, lang, {
      date_from: dateFrom,
      date_to: dateTo,
      interval: "day",
    }),
    dashboardApi.getBookingsByWeekday(session.accessToken, lang, {
      date_from: dateFrom,
      date_to: dateTo,
    }),
    dashboardApi.getStyleBreakdown(session.accessToken, lang, {
      date_from: dateFrom,
      date_to: dateTo,
    }),
    bookingsApi.list(session.accessToken, lang, {
      page: 1,
      page_size: 5,
      date_from: dateFrom,
      date_to: dateTo,
    }),
  ]);

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat(lang, {
      style: "currency",
      currency: currency,
    }).format(parseFloat(amount));
  };

  const statCardsData = overviewRes
    ? [
        {
          title: homeDict.stats?.totalBookings || "Total Bookings",
          value: overviewRes.total_bookings,
          icon: <CalendarCheck />,
        },
        {
          title: homeDict.stats?.totalRevenue || "Total Revenue",
          value: formatCurrency(overviewRes.total_revenue, overviewRes.currency),
          icon: <DollarSign />,
        },
        {
          title: homeDict.stats?.completionRate || "Completion Rate",
          value: `${overviewRes.completion_rate}%`,
          icon: <Activity />,
        },
        {
          title: homeDict.stats?.uniqueCustomers || "Unique Customers",
          value: overviewRes.unique_customers,
          icon: <Users />,
        },
      ]
    : [];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {homeDict.greeting}
        </h1>
        <DashboardFilters lang={lang as Locale} dict={dict.dashboard.bookings.filters} />
      </div>

      {overviewRes && <StatsCards cards={statCardsData} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {revenueTimeseriesRes && (
          <RevenueChart 
            data={revenueTimeseriesRes} 
            title={homeDict.revenueChart?.title || "Revenue"} 
          />
        )}
        {bookingsByWeekdayRes && (
          <BusiestDaysChart 
            data={bookingsByWeekdayRes} 
            title={homeDict.busiestDaysChart?.title || "Busiest Days"} 
            lang={lang as Locale} 
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {styleBreakdownRes && (
            <TopStylesChart 
              data={styleBreakdownRes} 
              title={homeDict.topStylesChart?.title || "Top Styles"} 
            />
          )}
        </div>
        <div className="lg:col-span-2">
          {recentBookingsRes && (
            <RecentBookingsTable 
              data={recentBookingsRes} 
              title={homeDict.recentBookings?.title || "Recent Bookings"} 
              viewAllText={homeDict.recentBookings?.viewAll || "View all bookings"} 
              lang={lang as Locale}
              statusMap={dict.dashboard.bookings.status as Record<string, string>}
            />
          )}
        </div>
      </div>
    </div>
  );
}
