"use client";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { ContactSubmissionsManager } from "@/components/dashboard/contact-submissions/contact-submissions-manager";
import { DashboardPageSkeleton } from "@/components/dashboard/shared/dashboard-page-skeleton";
import { adminContactSubmissionsApi } from "@/lib/api/admin-contact-submissions-client";
import type { AdminContactSubmissionsListParams, PaginationMeta } from "@/lib/api/types";
import { useAccessToken } from "@/lib/access-token";
import type { Locale } from "@/lib/i18n";
import { adminKeys } from "@/lib/query-keys";
import { useAdminQuery } from "@/lib/use-admin-query";

export function ContactSubmissionsPageClient({
  lang,
  dict,
  filters,
}: {
  lang: Locale;
  dict: Dictionary["dashboard"]["contactSubmissions"];
  filters: AdminContactSubmissionsListParams;
}) {
  const accessToken = useAccessToken();
  const query = useAdminQuery([...adminKeys.contactSubmissions, lang, filters], (token) =>
    adminContactSubmissionsApi.list(token, lang, filters)
  );
  if (query.isPending) return <DashboardPageSkeleton />;

  const submissions = Array.isArray(query.data?.items) ? query.data.items : [];
  const pagination: PaginationMeta = query.data?.pagination ?? {
    page: filters.page ?? 1,
    page_size: filters.page_size ?? 20,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  };

  return (
    <ContactSubmissionsManager
      key={`${JSON.stringify(filters)}-${query.dataUpdatedAt}`}
      accessToken={accessToken ?? ""}
      lang={lang}
      dict={dict}
      submissions={submissions}
      pagination={pagination}
      filters={filters}
      initialLoadError={query.isError}
    />
  );
}
