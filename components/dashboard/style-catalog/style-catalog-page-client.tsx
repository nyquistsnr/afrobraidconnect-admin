"use client";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { DashboardPageSkeleton } from "@/components/dashboard/shared/dashboard-page-skeleton";
import { StyleCatalogManager } from "@/components/dashboard/style-catalog/style-catalog-manager";
import { styleCatalogApi } from "@/lib/api/style-catalog-client";
import type { AdminAddon, AdminStyle, StyleCategory } from "@/lib/api/types";
import { useAccessToken } from "@/lib/access-token";
import type { Locale } from "@/lib/i18n";
import { adminKeys } from "@/lib/query-keys";
import { useAdminQuery } from "@/lib/use-admin-query";

export type StyleCatalogCache = {
  styles: AdminStyle[];
  categories: StyleCategory[];
  addons: AdminAddon[];
};

export const styleCatalogQueryKey = (lang: Locale) => [...adminKeys.styleCatalog, lang];

export function StyleCatalogPageClient({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["dashboard"]["styleCatalog"];
}) {
  const accessToken = useAccessToken();
  const query = useAdminQuery<StyleCatalogCache>(styleCatalogQueryKey(lang), async (token) => {
    const [stylePage, categories, addons] = await Promise.all([
      styleCatalogApi.styles(token, lang),
      styleCatalogApi.categories(token, lang),
      styleCatalogApi.addons(token, lang),
    ]);
    return { styles: stylePage.items, categories, addons };
  });
  if (query.isPending) return <DashboardPageSkeleton />;

  return (
    <StyleCatalogManager
      key={query.dataUpdatedAt}
      accessToken={accessToken ?? ""}
      lang={lang}
      dict={dict}
      initialStyles={query.data?.styles ?? []}
      initialCategories={query.data?.categories ?? []}
      initialAddons={query.data?.addons ?? []}
    />
  );
}
