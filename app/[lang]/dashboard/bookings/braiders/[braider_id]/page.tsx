import { renderScopedBookingsPage } from "@/app/[lang]/dashboard/bookings/scoped-page-runner";

export const metadata = { title: "Braider Bookings - Admin" };

export default async function BraiderBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; braider_id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang, braider_id: braiderId } = await params;
  return renderScopedBookingsPage({
    lang,
    searchParams: await searchParams,
    scopeKind: "braider",
    braiderId,
  });
}
