import { getDictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";

export const metadata = {
  title: "Dashboard - Afrobraider Admin",
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-muted-foreground">
        {dict.dashboard?.sidebar?.dashboard || "Dashboard"}
      </h1>
    </div>
  );
}
