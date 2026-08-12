import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { styleCatalogApi } from "@/lib/api/style-catalog-client";
import type { AdminAddon, AdminStyle, StyleCategory } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { StyleCatalogManager } from "@/components/dashboard/style-catalog/style-catalog-manager";

export const metadata = { title: "Style Catalog - Admin" };

export default async function StyleCatalogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang as Locale;
  const session = await auth();
  if (!session?.accessToken || session.user.userType !== "ADMIN") redirect(`/${locale}/login`);
  const dictionary = await getDictionary(locale);

  // Fetch the initial catalog on the server so the workspace renders with
  // content immediately; the client component handles subsequent mutations.
  let styles: AdminStyle[] = [];
  let categories: StyleCategory[] = [];
  let addons: AdminAddon[] = [];
  try {
    const [stylePage, categoryList, addonList] = await Promise.all([
      styleCatalogApi.styles(session.accessToken, locale),
      styleCatalogApi.categories(session.accessToken, locale),
      styleCatalogApi.addons(session.accessToken, locale),
    ]);
    styles = stylePage.items;
    categories = categoryList;
    addons = addonList;
  } catch (error) {
    console.error("Failed to load style catalog:", error);
  }

  return <StyleCatalogManager accessToken={session.accessToken} lang={locale} dict={dictionary.dashboard.styleCatalog} initialStyles={styles} initialCategories={categories} initialAddons={addons} />;
}
