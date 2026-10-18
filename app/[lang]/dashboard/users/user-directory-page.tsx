import { getDictionary } from "@/app/[lang]/dictionaries";
import { type Locale } from "@/lib/i18n";
import {
  UsersDashboardClient,
  type UserDirectorySection,
} from "@/components/dashboard/users/users-dashboard-client";

export type UserDirectoryPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function renderUserDirectoryPage(
  section: UserDirectorySection,
  { params, searchParams }: UserDirectoryPageProps,
) {
  const { lang } = await params;
  const locale = lang as Locale;
  const resolvedSearchParams = await searchParams;
  const dict = await getDictionary(locale);
  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page, 10) : 1;

  return (
    <UsersDashboardClient
      locale={locale}
      dict={dict}
      page={Number.isFinite(page) && page > 0 ? page : 1}
      section={section}
    />
  );
}
