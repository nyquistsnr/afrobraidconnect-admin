"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Filter,
  Mail,
  MailOpen,
  MessageSquareText,
  Phone,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import {
  adminContactSubmissionsApi,
} from "@/lib/api/admin-contact-submissions-client";
import type {
  AdminContactSubmission,
  AdminContactSubmissionsListParams,
  ContactSubmissionPlatform,
  ContactSubmissionPurpose,
  PaginationMeta,
} from "@/lib/api/types";
import { compactDateTime } from "@/components/dashboard/admin-commerce/formatters";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Select, type SelectOption } from "@/components/ui/select";
import type { Locale } from "@/lib/i18n";

type ContactSubmissionsDict = Dictionary["dashboard"]["contactSubmissions"];
type ReadFilter = "true" | "false";

const platforms: ContactSubmissionPlatform[] = ["CUSTOMER", "BRAIDER"];
const purposes: ContactSubmissionPurpose[] = [
  "GENERAL",
  "PARTNER",
  "PRICING",
  "FAQS",
];

const platformTone: Record<ContactSubmissionPlatform, BadgeTone> = {
  CUSTOMER: "info",
  BRAIDER: "brand",
};

export function ContactSubmissionsManager({
  accessToken,
  lang,
  dict,
  submissions,
  pagination,
  filters,
  initialLoadError,
}: {
  accessToken: string;
  lang: Locale;
  dict: ContactSubmissionsDict;
  submissions: AdminContactSubmission[];
  pagination: PaginationMeta;
  filters: AdminContactSubmissionsListParams;
  initialLoadError: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [items, setItems] = useState(submissions);
  const [selected, setSelected] = useState<AdminContactSubmission | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const hasActiveFilters = Boolean(
    filters.search ||
      filters.platform ||
      filters.purpose ||
      filters.is_read !== undefined ||
      filters.date_from ||
      filters.date_to
  );
  const [filtersOpen, setFiltersOpen] = useState(hasActiveFilters);
  const safePagination = pagination || {
    page: filters.page ?? 1,
    page_size: filters.page_size ?? 20,
    total_items: items.length,
    total_pages: items.length > 0 ? 1 : 0,
    has_next: false,
    has_previous: false,
  };

  const columns: DataTableColumn<AdminContactSubmission>[] = [
    {
      key: "created",
      header: dict.table.created,
      render: (submission) => (
        <div>
          <p className="font-medium">
            {compactDateTime(submission.created_at, lang)}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {shortId(submission.id)}
          </p>
        </div>
      ),
    },
    {
      key: "sender",
      header: dict.table.sender,
      render: (submission) => (
        <div className="min-w-52">
          <p className="font-semibold text-foreground">
            {senderName(submission)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {submission.email}
          </p>
        </div>
      ),
    },
    {
      key: "topic",
      header: dict.table.topic,
      render: (submission) => (
        <div className="max-w-sm space-y-2">
          <div className="flex flex-wrap gap-2">
            <PlatformBadge submission={submission} dict={dict} />
            <PurposeBadge submission={submission} dict={dict} />
            <ReadBadge submission={submission} dict={dict} />
          </div>
          <p className="line-clamp-1 font-medium text-foreground">
            {submission.subject || dict.noSubject}
          </p>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {submission.message}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: dict.table.status,
      render: (submission) => <ReadBadge submission={submission} dict={dict} />,
    },
    {
      key: "actions",
      header: dict.table.actions,
      align: "right",
      render: (submission) => (
        <button
          type="button"
          disabled={loadingId === submission.id}
          onClick={() => openSubmission(submission.id)}
          className="inline-flex items-center gap-2 border border-border bg-input px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-border/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Eye className="size-4" />
          {loadingId === submission.id ? dict.loading : dict.view}
        </button>
      ),
    },
  ];

  const summary = dict.pagination.summary
    .replace("{page}", String(safePagination.page))
    .replace("{totalPages}", String(safePagination.total_pages || 1))
    .replace("{totalItems}", String(safePagination.total_items));

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyFilters(nextFilters: AdminContactSubmissionsListParams) {
    const params = new URLSearchParams();
    if (nextFilters.search) params.set("search", nextFilters.search);
    if (nextFilters.platform) params.set("platform", nextFilters.platform);
    if (nextFilters.purpose) params.set("purpose", nextFilters.purpose);
    if (nextFilters.is_read !== undefined) {
      params.set("is_read", String(nextFilters.is_read));
    }
    if (nextFilters.date_from) params.set("date_from", nextFilters.date_from);
    if (nextFilters.date_to) params.set("date_to", nextFilters.date_to);
    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  }

  async function openSubmission(submissionId: string) {
    setLoadingId(submissionId);
    try {
      const submission = await adminContactSubmissionsApi.get(
        accessToken,
        lang,
        submissionId
      );
      setSelected(submission);
      updateSubmission(submission);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : dict.loadDetailError);
    } finally {
      setLoadingId(null);
    }
  }

  function updateSubmission(submission: AdminContactSubmission) {
    setItems((current) =>
      current.map((item) => (item.id === submission.id ? submission : item))
    );
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
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          className="inline-flex w-fit items-center justify-center gap-2 border border-border bg-input px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-border/40"
        >
          <Filter className="size-4" />
          {filtersOpen ? dict.hideFilters : dict.showFilters}
        </button>
      </div>

      {initialLoadError ? (
        <div className="border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          {dict.loadError}
        </div>
      ) : null}

      {filtersOpen ? (
        <FilterForm
          lang={lang}
          dict={dict}
          filters={filters}
          resetHref={`/${lang}/dashboard/contact-submissions`}
          onSubmit={applyFilters}
        />
      ) : null}

      <section className="border border-border bg-surface shadow-sm">
        <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="mt-0.5 bg-brand/10 p-2 text-brand">
            <MessageSquareText className="size-5" />
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
          data={items}
          getRowKey={(submission) => submission.id}
          renderMobileCard={(submission) => (
            <SubmissionCard
              submission={submission}
              dict={dict}
              lang={lang}
              loading={loadingId === submission.id}
              onView={() => openSubmission(submission.id)}
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
          page={safePagination.page}
          totalPages={safePagination.total_pages}
          hasNext={safePagination.has_next}
          hasPrevious={safePagination.has_previous}
          onPageChange={goToPage}
          summary={summary}
          previousLabel={dict.pagination.previous}
          nextLabel={dict.pagination.next}
        />
      </section>

      {selected ? (
        <SubmissionModal
          accessToken={accessToken}
          lang={lang}
          dict={dict}
          submission={selected}
          onClose={() => setSelected(null)}
          onChanged={(submission) => {
            setSelected(submission);
            updateSubmission(submission);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function FilterForm({
  lang,
  dict,
  filters,
  resetHref,
  onSubmit,
}: {
  lang: Locale;
  dict: ContactSubmissionsDict;
  filters: AdminContactSubmissionsListParams;
  resetHref: string;
  onSubmit: (filters: AdminContactSubmissionsListParams) => void;
}) {
  const [search, setSearch] = useState(filters.search ?? "");
  const [platform, setPlatform] = useState<ContactSubmissionPlatform | "">(
    filters.platform ?? ""
  );
  const [purpose, setPurpose] = useState<ContactSubmissionPurpose | "">(
    filters.purpose ?? ""
  );
  const [isRead, setIsRead] = useState<ReadFilter | "">(
    filters.is_read === undefined ? "" : (String(filters.is_read) as ReadFilter)
  );
  const [dateFrom, setDateFrom] = useState(filters.date_from ?? "");
  const [dateTo, setDateTo] = useState(filters.date_to ?? "");

  const platformOptions: SelectOption<ContactSubmissionPlatform>[] = platforms.map(
    (value) => ({
      value,
      label: dict.platformLabels[value],
    })
  );
  const purposeOptions: SelectOption<ContactSubmissionPurpose>[] = purposes.map(
    (value) => ({
      value,
      label: dict.purposeLabels[value],
    })
  );
  const readOptions: SelectOption<ReadFilter>[] = [
    { value: "false", label: dict.unread },
    { value: "true", label: dict.read },
  ];

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      search: search.trim() || undefined,
      platform: platform || undefined,
      purpose: purpose || undefined,
      is_read: isRead ? isRead === "true" : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });
  }

  return (
    <form onSubmit={submit} className="border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Filter className="size-4 text-brand" />
        {dict.filters.title}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input
          name="search"
          label={dict.filters.searchLabel}
          showLabel
          icon={Search}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={dict.filters.searchPlaceholder}
        />
        <Select
          label={dict.filters.platform}
          showLabel
          value={platform}
          onChange={setPlatform}
          options={platformOptions}
          placeholder={dict.filters.allPlatforms}
        />
        <Select
          label={dict.filters.purpose}
          showLabel
          value={purpose}
          onChange={setPurpose}
          options={purposeOptions}
          placeholder={dict.filters.allPurposes}
        />
        <Select
          label={dict.filters.readStatus}
          showLabel
          value={isRead}
          onChange={setIsRead}
          options={readOptions}
          placeholder={dict.filters.allReadStatuses}
        />
        <div className="md:col-span-2 xl:col-span-2">
          <DateRangePicker
            label={dict.filters.createdRange}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={(from, to) => {
              setDateFrom(from);
              setDateTo(to);
            }}
            placeholder={dict.filters.dateRangePlaceholder}
            presetsLabel={dict.filters.presets}
            todayLabel={dict.filters.today}
            last7DaysLabel={dict.filters.last7Days}
            thisMonthLabel={dict.filters.thisMonth}
            lastMonthLabel={dict.filters.lastMonth}
            clearLabel={dict.filters.clear}
            applyLabel={dict.filters.applyRange}
            previousMonthLabel={dict.filters.previousMonth}
            nextMonthLabel={dict.filters.nextMonth}
            lang={lang}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <a
          href={resetHref}
          className="inline-flex items-center justify-center gap-2 border border-border bg-input px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-border/40"
        >
          <RotateCcw className="size-4" />
          {dict.filters.reset}
        </a>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
        >
          <Filter className="size-4" />
          {dict.filters.apply}
        </button>
      </div>
    </form>
  );
}

function SubmissionCard({
  submission,
  dict,
  lang,
  loading,
  onView,
}: {
  submission: AdminContactSubmission;
  dict: ContactSubmissionsDict;
  lang: Locale;
  loading: boolean;
  onView: () => void;
}) {
  return (
    <div className="border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <ReadBadge submission={submission} dict={dict} />
            <PlatformBadge submission={submission} dict={dict} />
          </div>
          <div>
            <p className="truncate font-semibold text-foreground">
              {submission.subject || dict.noSubject}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {compactDateTime(submission.created_at, lang)}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={onView}
          aria-label={`${dict.view} ${submission.id}`}
          className="p-2 text-muted-foreground hover:bg-border/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Eye className="size-4" />
        </button>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <MobileDetail label={dict.table.sender} value={senderName(submission)} />
        <MobileDetail label={dict.modal.email} value={submission.email} />
        <MobileDetail label={dict.table.message} value={submission.message} />
      </dl>
    </div>
  );
}

function SubmissionModal({
  accessToken,
  lang,
  dict,
  submission,
  onClose,
  onChanged,
}: {
  accessToken: string;
  lang: Locale;
  dict: ContactSubmissionsDict;
  submission: AdminContactSubmission;
  onClose: () => void;
  onChanged: (submission: AdminContactSubmission) => void;
}) {
  const [saving, setSaving] = useState(false);

  async function mark(nextRead: boolean) {
    setSaving(true);
    try {
      const updated = nextRead
        ? await adminContactSubmissionsApi.markRead(accessToken, lang, submission.id)
        : await adminContactSubmissionsApi.markUnread(accessToken, lang, submission.id);
      const fallback: AdminContactSubmission = {
        ...submission,
        is_read: nextRead,
        read_at: nextRead ? new Date().toISOString() : null,
        read_by_admin_id: nextRead ? submission.read_by_admin_id : null,
      };
      onChanged(updated ?? fallback);
      toast.success(nextRead ? dict.markedRead : dict.markedUnread);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : dict.actionError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} labelledBy="contact-submission-modal" size="lg">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="contact-submission-modal" className="text-lg font-bold">
              {dict.modal.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dict.modal.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.close}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <ReadBadge submission={submission} dict={dict} />
          <PlatformBadge submission={submission} dict={dict} />
          <PurposeBadge submission={submission} dict={dict} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Detail label={dict.modal.name} value={senderName(submission)} />
          <Detail
            label={dict.modal.createdAt}
            value={compactDateTime(submission.created_at, lang)}
          />
          <Detail
            label={dict.modal.email}
            value={submission.email}
            icon={Mail}
            href={`mailto:${submission.email}`}
          />
          <Detail
            label={dict.modal.phone}
            value={submission.phone_number || "-"}
            icon={Phone}
            href={submission.phone_number ? `tel:${submission.phone_number}` : undefined}
          />
          <Detail
            label={dict.modal.readAt}
            value={compactDateTime(submission.read_at, lang)}
          />
          <Detail
            label={dict.modal.readBy}
            value={submission.read_by_admin_id || "-"}
            mono={!!submission.read_by_admin_id}
          />
        </div>

        <div className="border border-border bg-border/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {dict.modal.subject}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {submission.subject || dict.noSubject}
          </p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {submission.message}
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            className="w-auto"
            onClick={onClose}
          >
            {dict.close}
          </Button>
          {submission.is_read ? (
            <Button
              type="button"
              variant="outline"
              className="w-auto"
              disabled={saving}
              onClick={() => mark(false)}
            >
              <EyeOff className="size-4" />
              {saving ? dict.saving : dict.markUnread}
            </Button>
          ) : (
            <Button
              type="button"
              className="w-auto"
              disabled={saving}
              onClick={() => mark(true)}
            >
              <MailOpen className="size-4" />
              {saving ? dict.saving : dict.markRead}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function ReadBadge({
  submission,
  dict,
}: {
  submission: AdminContactSubmission;
  dict: ContactSubmissionsDict;
}) {
  return (
    <Badge tone={submission.is_read ? "neutral" : "warning"} dot={!submission.is_read}>
      {submission.is_read ? dict.read : dict.unread}
    </Badge>
  );
}

function PlatformBadge({
  submission,
  dict,
}: {
  submission: AdminContactSubmission;
  dict: ContactSubmissionsDict;
}) {
  return (
    <Badge tone={platformTone[submission.platform]} dot={false}>
      {dict.platformLabels[submission.platform]}
    </Badge>
  );
}

function PurposeBadge({
  submission,
  dict,
}: {
  submission: AdminContactSubmission;
  dict: ContactSubmissionsDict;
}) {
  if (!submission.purpose) {
    return <Badge tone="neutral" dot={false}>{dict.noPurpose}</Badge>;
  }
  return (
    <Badge tone="brand" dot={false}>
      {dict.purposeLabels[submission.purpose]}
    </Badge>
  );
}

function Detail({
  label,
  value,
  mono = false,
  icon: Icon,
  href,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: typeof Mail;
  href?: string;
}) {
  const content = (
    <span className="inline-flex min-w-0 items-center gap-2">
      {Icon ? <Icon className="size-4 shrink-0 text-icon-muted" /> : null}
      <span className="break-all">{value}</span>
    </span>
  );

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {href ? (
        <a
          href={href}
          className={`mt-1 block text-sm text-foreground hover:text-brand ${
            mono ? "font-mono" : "font-medium"
          }`}
        >
          {content}
        </a>
      ) : (
        <p
          className={`mt-1 text-sm text-foreground ${
            mono ? "font-mono" : "font-medium"
          }`}
        >
          {content}
        </p>
      )}
    </div>
  );
}

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 line-clamp-3 text-foreground">{value}</dd>
    </div>
  );
}

function senderName(submission: AdminContactSubmission) {
  return [submission.first_name, submission.last_name].filter(Boolean).join(" ") || submission.email;
}

function shortId(id: string) {
  return id.length > 8 ? id.slice(0, 8) : id;
}
