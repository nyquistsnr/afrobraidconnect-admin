"use client";

import type { AdminPaymentsDict } from "@/components/dashboard/admin-commerce/admin-dictionaries";
import { extractPagination } from "@/components/dashboard/admin-commerce/formatters";
import { AdminPaymentsManager } from "@/components/dashboard/payments/admin-payments-manager";
import { DashboardPageSkeleton } from "@/components/dashboard/shared/dashboard-page-skeleton";
import { adminPaymentsApi } from "@/lib/api/admin-payments-client";
import type { AdminPaymentsListParams } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { adminKeys } from "@/lib/query-keys";
import { useAdminQuery } from "@/lib/use-admin-query";

export function AdminPaymentsPageClient({
  lang,
  dict,
  filters,
}: {
  lang: Locale;
  dict: AdminPaymentsDict;
  filters: AdminPaymentsListParams;
}) {
  const query = useAdminQuery([...adminKeys.payments, lang, filters], (token) =>
    adminPaymentsApi.list(token, lang, filters)
  );
  if (query.isPending && !query.isError) return <DashboardPageSkeleton />;

  const payments = Array.isArray(query.data?.items) ? query.data.items : [];
  const pagination = extractPagination(query.data, filters.page ?? 1, filters.page_size ?? 20, payments.length);

  return (
    <AdminPaymentsManager
      key={`${JSON.stringify(filters)}-${query.dataUpdatedAt}`}
      lang={lang}
      dict={dict}
      payments={payments}
      pagination={pagination}
      filters={filters}
      initialLoadError={query.isError}
    />
  );
}
