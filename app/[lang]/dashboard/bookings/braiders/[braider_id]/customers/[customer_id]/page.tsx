import { renderScopedBookingsPage } from "@/app/[lang]/dashboard/bookings/scoped-page-runner";

export const metadata = { title: "Braider Customer Bookings - Admin" };

export default async function BraiderCustomerBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; braider_id: string; customer_id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const {
    lang,
    braider_id: braiderId,
    customer_id: customerId,
  } = await params;
  return renderScopedBookingsPage({
    lang,
    searchParams: await searchParams,
    scopeKind: "relationship",
    braiderId,
    customerId,
  });
}
