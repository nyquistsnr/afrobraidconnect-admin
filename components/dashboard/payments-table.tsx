"use client";

import { useState, useMemo, type ReactNode } from "react";
import type { PaymentListResponse, PaymentListItemResponse } from "@/lib/api/types";
import { Locale } from "@/lib/i18n";
import { CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw, Inbox } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api/payments-client";
import { useSession } from "next-auth/react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";

interface PaymentsTableProps {
  initialData: PaymentListResponse;
  lang: Locale;
  dict?: any;
  dateFrom?: string;
  dateTo?: string;
}

const STATUS_ICONS: Record<string, ReactNode> = {
  SUCCEEDED: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  PENDING: <Clock className="h-4 w-4 text-amber-500" />,
  FAILED: <XCircle className="h-4 w-4 text-red-500" />,
  CANCELED: <AlertCircle className="h-4 w-4 text-slate-500" />,
};

const STATUS_COLORS: Record<string, string> = {
  SUCCEEDED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  CANCELED: "bg-slate-50 text-slate-700 border-slate-200",
};

function PaymentCard({
  payment,
  lang,
  dict,
}: {
  payment: PaymentListItemResponse;
  lang: Locale;
  dict: any;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat(lang, {
      style: "currency",
      currency: currency,
    }).format(parseFloat(amount));
  };

  return (
    <div className="flex w-full flex-col gap-3 border border-border bg-surface p-4 text-left shadow-sm transition-colors hover:border-brand/50 hover:bg-border/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {payment.booking_reference}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDate(payment.created_at)}
          </p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${STATUS_COLORS[payment.status] || STATUS_COLORS.PENDING}`}>
          {STATUS_ICONS[payment.status] || STATUS_ICONS.PENDING}
          {payment.status}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
          {payment.purpose}
        </span>
      </div>

      <div className="flex flex-col items-end border-t border-border pt-3">
        <div className="flex w-full justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {dict?.columns?.amount || "Amount"}
          </span>
          <span className="text-base font-bold text-foreground">
            {formatCurrency(payment.amount, payment.currency)}
          </span>
        </div>
        {payment.is_refunded && (
          <div className="flex w-full justify-end mt-1">
            <span className="text-xs text-red-500 flex items-center">
              <RefreshCw className="h-3 w-3 mr-1" />
              {dict?.refunded || "Refunded"} {formatCurrency(payment.amount_refunded, payment.currency)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function PaymentsTable({ initialData, lang, dict, dateFrom, dateTo }: PaymentsTableProps) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const isDefaultQuery = page === 1;

  const filterParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      date_from: dateFrom,
      date_to: dateTo,
    }),
    [page, pageSize, dateFrom, dateTo]
  );

  const paymentsQuery = useQuery({
    queryKey: ["braider-payments", filterParams],
    queryFn: () => paymentsApi.list(accessToken!, lang, filterParams),
    enabled: !!accessToken,
    initialData: isDefaultQuery ? initialData : undefined,
    placeholderData: (previous) => previous,
  });

  const data = paymentsQuery.data || initialData;
  const items = data.items || [];
  const isLoading = paymentsQuery.isLoading || paymentsQuery.isPlaceholderData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat(lang, {
      style: "currency",
      currency: currency,
    }).format(parseFloat(amount));
  };

  const columns: DataTableColumn<PaymentListItemResponse>[] = [
    {
      key: "date",
      header: dict?.columns?.date || "Date",
      render: (row) => (
        <span className="text-muted-foreground">{formatDate(row.created_at)}</span>
      ),
    },
    {
      key: "bookingRef",
      header: dict?.columns?.bookingRef || "Booking Ref",
      render: (row) => <span className="font-medium">{row.booking_reference}</span>,
    },
    {
      key: "purpose",
      header: dict?.columns?.purpose || "Purpose",
      render: (row) => (
        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
          {row.purpose}
        </span>
      ),
    },
    {
      key: "amount",
      header: dict?.columns?.amount || "Amount",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">
            {formatCurrency(row.amount, row.currency)}
          </span>
          {row.is_refunded && (
            <span className="text-xs text-red-500 flex items-center mt-1">
              <RefreshCw className="h-3 w-3 mr-1" />
              {dict?.refunded || "Refunded"} {formatCurrency(row.amount_refunded, row.currency)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: dict?.columns?.status || "Status",
      render: (row) => (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${STATUS_COLORS[row.status] || STATUS_COLORS.PENDING}`}>
          {STATUS_ICONS[row.status] || STATUS_ICONS.PENDING}
          {row.status}
        </span>
      ),
    },
  ];

  const emptyState = (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <Inbox className="size-8 text-icon-muted" />
      <h3 className="text-lg font-medium">{dict?.emptyTitle || "No payments"}</h3>
      <p className="max-w-xs text-sm text-muted-foreground">
        {dict?.emptySubtitle || "You haven't received any payments yet."}
      </p>
    </div>
  );

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden mt-6">
      <div className="p-6 pb-4 border-b">
        <h3 className="text-lg font-medium">{dict?.title || "Recent Payments"}</h3>
      </div>
      
      <DataTable
        columns={columns}
        data={items}
        getRowKey={(row) => row.id}
        renderMobileCard={(row) => (
          <PaymentCard payment={row} lang={lang} dict={dict} />
        )}
        isLoading={isLoading}
        emptyState={emptyState}
      />

      {data && data.total_pages > 1 && (
        <div className="bg-surface">
          <Pagination
            page={data.page}
            totalPages={data.total_pages}
            hasNext={data.has_next}
            hasPrevious={data.has_previous}
            onPageChange={setPage}
            disabled={isLoading}
            summary={dict?.pagination 
              ? dict.pagination
                  .replace('{start}', String((data.page - 1) * data.page_size + 1))
                  .replace('{end}', String(Math.min(data.page * data.page_size, data.total_items)))
                  .replace('{total}', String(data.total_items))
              : `Showing ${(data.page - 1) * data.page_size + 1} to ${Math.min(data.page * data.page_size, data.total_items)} of ${data.total_items} results`
            }
            previousLabel="Previous"
            nextLabel="Next"
          />
        </div>
      )}
    </div>
  );
}
