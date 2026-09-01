import { getDictionary } from "@/app/[lang]/dictionaries";
import { type Locale } from "@/lib/i18n";
import { UsersDashboardClient } from "@/components/dashboard/users/users-dashboard-client";

export const metadata = {
  title: "User Management - Admin",
};

export default async function UsersDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;
  const resolvedSearchParams = await searchParams;
  const dict = await getDictionary(locale);
  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page, 10) : 1;
  const userType = typeof resolvedSearchParams.user_type === "string" ? resolvedSearchParams.user_type : undefined;

  return (
    <UsersDashboardClient
      locale={locale}
      dict={dict}
      page={Number.isFinite(page) && page > 0 ? page : 1}
      userType={userType}
    />
  );
}
