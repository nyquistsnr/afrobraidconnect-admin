import { renderScopedBookingsPage } from "@/app/[lang]/dashboard/bookings/scoped-page-runner";

export const metadata = { title: "Customer Bookings - Admin" };

export default async function CustomerBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; customer_id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang, customer_id: customerId } = await params;
  return renderScopedBookingsPage({
    lang,
    searchParams: await searchParams,
    scopeKind: "customer",
    customerId,
  });
}
