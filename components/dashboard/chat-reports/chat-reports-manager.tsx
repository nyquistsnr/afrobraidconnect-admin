"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, MessageSquareWarning, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { adminChatReportsApi } from "@/lib/api/admin-chat-reports-client";
import type {
  AdminChatReport,
  ChatReportStatus,
  PaginationMeta,
} from "@/lib/api/types";
import { formatDate, formatTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";

type ChatReportsDict = Dictionary["dashboard"]["chatReports"];

const statuses: ChatReportStatus[] = [
  "OPEN",
  "UNDER_REVIEW",
  "RESOLVED",
  "DISMISSED",
];

const statusTone: Record<ChatReportStatus, BadgeTone> = {
  OPEN: "danger",
  UNDER_REVIEW: "warning",
  RESOLVED: "success",
  DISMISSED: "neutral",
};

export function ChatReportsManager({
  accessToken,
  lang,
  dict,
  initialReports,
  initialPagination,
  status,
  page,
  initialLoadError,
}: {
  accessToken: string;
  lang: Locale;
  dict: ChatReportsDict;
  initialReports: AdminChatReport[];
  initialPagination: PaginationMeta;
  status: ChatReportStatus;
  page: number;
  initialLoadError: boolean;
}) {
  const router = useRouter();
  const [reports, setReports] = useState(initialReports);
  const [selectedReport, setSelectedReport] = useState<AdminChatReport | null>(
    null
  );

  const columns: DataTableColumn<AdminChatReport>[] = useMemo(
    () => [
      {
        key: "created",
        header: dict.table.created,
        render: (report) => (
          <div>
            <p className="font-medium">
              {formatDate(report.created_at, lang)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatTime(report.created_at, lang)}
            </p>
          </div>
        ),
      },
      {
        key: "people",
        header: dict.table.people,
        render: (report) => (
          <div className="min-w-48 space-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground">
                {dict.table.reporter}:{" "}
              </span>
              <span className="font-medium">{report.reporter_name}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">
                {dict.table.reported}:{" "}
              </span>
              <span className="font-medium">{report.reported_user_name}</span>
            </p>
          </div>
        ),
      },
      {
        key: "reason",
        header: dict.table.reason,
        render: (report) => (
          <div className="space-y-2">
            <Badge tone="brand" dot={false}>
              {dict.reasonLabels[report.reason]}
            </Badge>
            <p className="line-clamp-2 max-w-xs text-sm text-muted-foreground">
              {report.details || dict.noDetails}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: dict.table.status,
        render: (report) => <StatusBadge report={report} dict={dict} />,
      },
      {
        key: "actions",
        header: dict.table.actions,
        align: "right",
        render: (report) => (
          <button
            type="button"
            onClick={() => setSelectedReport(report)}
            aria-label={`${dict.review} ${report.id}`}
            title={dict.review}
            className="inline-flex items-center gap-2 border border-border bg-input px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-border/40"
          >
            <Eye className="size-4" />
            {dict.review}
          </button>
        ),
      },
    ],
    [dict, lang]
  );

  const paginationSummary = dict.pagination.summary
    .replace("{page}", String(initialPagination.page))
    .replace("{totalPages}", String(initialPagination.total_pages || 1))
    .replace("{totalItems}", String(initialPagination.total_items));

  function goToPage(nextPage: number) {
    router.push(
      `/${lang}/dashboard/chat-reports?status=${status}&page=${nextPage}`
    );
  }

  function reportHref(nextStatus: ChatReportStatus) {
    return `/${lang}/dashboard/chat-reports?status=${nextStatus}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-brand">{dict.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {dict.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{dict.subtitle}</p>
        </div>
      </div>

      {initialLoadError && (
        <div className="border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          {dict.loadError}
        </div>
      )}

      <div className="border-b border-border">
        <nav
          className="-mb-px flex gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          aria-label={dict.tabsLabel}
        >
          {statuses.map((tabStatus) => {
            const isActive = tabStatus === status;
            return (
              <Link
                key={tabStatus}
                href={reportHref(tabStatus)}
                aria-current={isActive ? "page" : undefined}
                className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-semibold ${
                  isActive
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {dict.statusLabels[tabStatus]}
              </Link>
            );
          })}
        </nav>
      </div>

      <section className="border border-border bg-surface shadow-sm">
        <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="mt-0.5 bg-brand/10 p-2 text-brand">
            <MessageSquareWarning className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              {dict.listTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dict.listSubtitle}
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={reports}
          getRowKey={(report) => report.id}
          renderMobileCard={(report) => (
            <ReportCard
              report={report}
              dict={dict}
              lang={lang}
              onReview={() => setSelectedReport(report)}
            />
          )}
          emptyState={
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {dict.emptyTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {dict.emptyDescription}
              </p>
            </div>
          }
        />

        <Pagination
          page={page}
          totalPages={initialPagination.total_pages}
          hasNext={initialPagination.has_next}
          hasPrevious={initialPagination.has_previous}
          onPageChange={goToPage}
          summary={paginationSummary}
          previousLabel={dict.pagination.previous}
          nextLabel={dict.pagination.next}
        />
      </section>

      {selectedReport && (
        <ReportModal
          key={selectedReport.id}
          accessToken={accessToken}
          lang={lang}
          dict={dict}
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onSaved={(updatedReport) => {
            setReports((current) =>
              current.map((report) =>
                report.id === updatedReport.id ? updatedReport : report
              )
            );
            setSelectedReport(updatedReport);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({
  report,
  dict,
}: {
  report: AdminChatReport;
  dict: ChatReportsDict;
}) {
  return (
    <Badge tone={statusTone[report.status]} dot={false}>
      {dict.statusLabels[report.status]}
    </Badge>
  );
}

function ReportCard({
  report,
  dict,
  lang,
  onReview,
}: {
  report: AdminChatReport;
  dict: ChatReportsDict;
  lang: Locale;
  onReview: () => void;
}) {
  return (
    <div className="border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <StatusBadge report={report} dict={dict} />
          <div>
            <p className="font-semibold text-foreground">
              {dict.reasonLabels[report.reason]}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(report.created_at, lang)} -{" "}
              {formatTime(report.created_at, lang)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onReview}
          aria-label={`${dict.review} ${report.id}`}
          className="p-2 text-muted-foreground hover:bg-border/40 hover:text-foreground"
        >
          <Eye className="size-4" />
        </button>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {dict.table.reporter}
          </dt>
          <dd className="mt-1 text-foreground">{report.reporter_name}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {dict.table.reported}
          </dt>
          <dd className="mt-1 text-foreground">{report.reported_user_name}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {dict.table.details}
          </dt>
          <dd className="mt-1 text-muted-foreground">
            {report.details || dict.noDetails}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function ReportModal({
  accessToken,
  lang,
  dict,
  report,
  onClose,
  onSaved,
}: {
  accessToken: string;
  lang: Locale;
  dict: ChatReportsDict;
  report: AdminChatReport;
  onClose: () => void;
  onSaved: (report: AdminChatReport) => void;
}) {
  const [status, setStatus] = useState<ChatReportStatus>(report.status);
  const [notes, setNotes] = useState(report.admin_notes ?? "");
  const [saving, setSaving] = useState(false);

  const statusOptions = statuses.map((value) => ({
    value,
    label: dict.statusLabels[value],
  }));

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const trimmedNotes = notes.trim();
      const updated = await adminChatReportsApi.update(
        accessToken,
        lang,
        report.id,
        {
          status,
          ...(trimmedNotes ? { admin_notes: trimmedNotes } : {}),
        }
      );
      toast.success(dict.saved);
      onSaved(updated);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : dict.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} labelledBy="chat-report-modal" size="lg">
      <form onSubmit={save} className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="chat-report-modal" className="text-lg font-bold">
              {dict.modal.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dict.modal.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.cancel}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Detail label={dict.modal.reporter} value={report.reporter_name} />
          <Detail
            label={dict.modal.reportedUser}
            value={report.reported_user_name}
          />
          <Detail
            label={dict.modal.bookingId}
            value={report.booking_id}
            mono
          />
          <Detail
            label={dict.modal.threadId}
            value={report.thread_id}
            mono
          />
          <Detail
            label={dict.modal.messageId}
            value={report.message_id || dict.modal.noMessage}
            mono={!!report.message_id}
          />
          <Detail
            label={dict.modal.updatedAt}
            value={`${formatDate(report.updated_at, lang)} ${formatTime(
              report.updated_at,
              lang
            )}`}
          />
        </div>

        <div className="border border-border bg-border/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {dict.modal.reason}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {dict.reasonLabels[report.reason]}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {report.details || dict.noDetails}
          </p>
        </div>

        <Select<ChatReportStatus>
          label={dict.modal.statusLabel}
          showLabel
          value={status}
          onChange={setStatus}
          options={statusOptions}
        />

        <label className="block text-sm font-medium text-foreground">
          <span className="mb-1.5 block">{dict.modal.notesLabel}</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={dict.modal.notesPlaceholder}
            className="min-h-32 w-full border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-brand"
          />
        </label>

        <p className="text-xs text-muted-foreground">{dict.modal.notesHelp}</p>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            className="w-auto"
            onClick={onClose}
          >
            {dict.cancel}
          </Button>
          <Button className="w-auto" disabled={saving}>
            <Save className="size-4" />
            {saving ? dict.saving : dict.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 break-all text-sm text-foreground ${
          mono ? "font-mono" : "font-medium"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
