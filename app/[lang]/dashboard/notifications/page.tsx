import { redirect, notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { Locale } from "@/lib/i18n";
import { auth } from "@/auth";
import { NotificationsList } from "@/components/dashboard/notifications/notifications-list";

export const metadata = {
  title: "Notifications",
};

export default async function DashboardNotificationsPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);
  const session = await auth();

  if (!session?.accessToken) {
    redirect(`/${lang}/login`);
  }

  return (
    <div className="w-full">
      <NotificationsList
        lang={lang as Locale}
        dict={dict.dashboard.header}
        common={dict.common}
      />
    </div>
  );
}
