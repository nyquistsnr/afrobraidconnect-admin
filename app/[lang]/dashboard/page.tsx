import { getDictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";

export const metadata = {
  title: "Dashboard - Afrobraider Admin",
};

export default async function DashboardPage({
  params,
}: {
  params: { lang: string };
}) {
  const lang = params.lang as Locale;
  const dict = await getDictionary(lang);

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-muted-foreground">
        Dashboard
      </h1>
    </div>
  );
}
