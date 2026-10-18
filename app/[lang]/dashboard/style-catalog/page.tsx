import { getDictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { StyleCatalogPageClient } from "@/components/dashboard/style-catalog/style-catalog-page-client";

export const metadata = { title: "Style Catalog - Admin" };

export default async function StyleCatalogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const dictionary = await getDictionary(locale);

  // Data is loaded and cached client-side (TanStack Query), so revisits don't refetch.
  return <StyleCatalogPageClient lang={locale} dict={dictionary.dashboard.styleCatalog} />;
}
