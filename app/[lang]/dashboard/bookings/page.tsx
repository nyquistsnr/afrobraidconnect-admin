import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale, locales } from "../../dictionaries";
import { auth } from "@/auth";
import { bookingsApi } from "@/lib/api/bookings-client";
import { BookingsTable } from "@/components/dashboard/bookings-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CalendarDays, CheckCircle, XCircle, Clock } from "lucide-react";
export default async function BookingsPage(props: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { lang } = await props.params;
  const searchParams = await props.searchParams;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
    redirect(`/${lang}/login`);
  }

  const dict = await getDictionary(lang);

  const status = searchParams.status as any;
  const dateFrom = searchParams.date_from;
  const dateTo = searchParams.date_to;
  const search = searchParams.search;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  
  // Fetch data in parallel
  const [initialData, statsResponse] = await Promise.all([
    bookingsApi.list(session.accessToken, lang, {
      status,
      date_from: dateFrom,
      date_to: dateTo,
      search,
      page,
      page_size: 20
    }),
    bookingsApi.getStats(session.accessToken, lang, {
      date_from: dateFrom,
      date_to: dateTo,
    })
  ]);
  
  const stats = statsResponse;

  const statCardsData = stats ? [
    {
      title: dict.dashboard.bookings.stats.totalBookings,
      value: stats.total_bookings,
      icon: <CalendarDays />,
    },
    {
      title: dict.dashboard.bookings.stats.completed,
      value: stats.completed,
      icon: <CheckCircle />,
    },
    {
      title: dict.dashboard.bookings.stats.upcoming,
      value: stats.upcoming,
      icon: <Clock />,
    },
    {
      title: dict.dashboard.bookings.stats.declined,
      value: stats.declined,
      icon: <XCircle />,
    },
  ] : [];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {dict.dashboard.bookings.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.dashboard.bookings.subtitle}
        </p>
      </div>

      {stats && <StatsCards cards={statCardsData} />}

      <BookingsTable
        dict={dict.dashboard.bookings}
        common={dict.common}
        lang={lang}
        initialData={initialData}
      />
    </div>
  );
}
