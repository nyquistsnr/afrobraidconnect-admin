"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Eye, MessageSquareText, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { adminReviewsApi } from "@/lib/api/admin-reviews-client";
import type { AdminReview, PaginationMeta, ReviewStatus } from "@/lib/api/types";
import { formatDate, formatTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";

type ReviewsDict = Dictionary["dashboard"]["reviews"];

const statuses: ReviewStatus[] = ["PENDING", "APPROVED", "REJECTED"];

const statusTone: Record<ReviewStatus, BadgeTone> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

export function ReviewsManager({
  accessToken,
  lang,
  dict,
  initialReviews,
  initialPagination,
  status,
  page,
  initialLoadError,
}: {
  accessToken: string;
  lang: Locale;
  dict: ReviewsDict;
  initialReviews: AdminReview[];
  initialPagination: PaginationMeta;
  status: ReviewStatus;
  page: number;
  initialLoadError: boolean;
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  async function moderate(review: AdminReview, action: "approve" | "reject") {
    setActingId(review.id);
    try {
      const updated =
        action === "approve"
          ? await adminReviewsApi.approve(accessToken, lang, review.id)
          : await adminReviewsApi.reject(accessToken, lang, review.id);

      setReviews((current) =>
        updated.status === status
          ? current.map((item) => (item.id === updated.id ? updated : item))
          : current.filter((item) => item.id !== updated.id)
      );
      setSelectedReview(null);
      toast.success(
        action === "approve" ? dict.approvedToast : dict.rejectedToast
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : dict.actionError);
    } finally {
      setActingId(null);
    }
  }

  const columns: DataTableColumn<AdminReview>[] = [
      {
        key: "created",
        header: dict.table.created,
        render: (review) => (
          <div>
            <p className="font-medium">{formatDate(review.created_at, lang)}</p>
            <p className="text-xs text-muted-foreground">
              {formatTime(review.created_at, lang)}
            </p>
          </div>
        ),
      },
      {
        key: "people",
        header: dict.table.people,
        render: (review) => (
          <div className="min-w-48 space-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground">
                {dict.table.braider}:{" "}
              </span>
              <span className="font-medium">{review.braider_name}</span>
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">
                {dict.table.customer}:{" "}
              </span>
              <span className="font-medium">{review.customer_name}</span>
            </p>
          </div>
        ),
      },
      {
        key: "rating",
        header: dict.table.rating,
        render: (review) => <Rating rating={review.rating} label={dict.star} />,
      },
      {
        key: "comment",
        header: dict.table.comment,
        render: (review) => (
          <p className="line-clamp-3 max-w-sm text-sm text-muted-foreground">
            {localizedComment(review, lang) || dict.noComment}
          </p>
        ),
      },
      {
        key: "status",
        header: dict.table.status,
        render: (review) => <StatusBadge review={review} dict={dict} />,
      },
      {
        key: "actions",
        header: dict.table.actions,
        align: "right",
        render: (review) => (
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => setSelectedReview(review)}
              title={dict.review}
              aria-label={`${dict.review} ${review.id}`}
              className="p-2 text-muted-foreground transition-colors hover:bg-border/40 hover:text-foreground"
            >
              <Eye className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => moderate(review, "approve")}
              title={dict.approve}
              aria-label={`${dict.approve} ${review.id}`}
              disabled={actingId === review.id || review.status === "APPROVED"}
              className="p-2 text-emerald-600 transition-colors hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => moderate(review, "reject")}
              title={dict.reject}
              aria-label={`${dict.reject} ${review.id}`}
              disabled={actingId === review.id || review.status === "REJECTED"}
              className="p-2 text-red-600 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ),
      },
    ];

  const paginationSummary = dict.pagination.summary
    .replace("{page}", String(initialPagination.page))
    .replace("{totalPages}", String(initialPagination.total_pages || 1))
    .replace("{totalItems}", String(initialPagination.total_items));

  function goToPage(nextPage: number) {
    router.push(`/${lang}/dashboard/reviews?status=${status}&page=${nextPage}`);
  }

  function statusHref(nextStatus: ReviewStatus) {
    return `/${lang}/dashboard/reviews?status=${nextStatus}`;
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
                href={statusHref(tabStatus)}
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
          data={reviews}
          getRowKey={(review) => review.id}
          renderMobileCard={(review) => (
            <ReviewCard
              review={review}
              dict={dict}
              lang={lang}
              acting={actingId === review.id}
              onReview={() => setSelectedReview(review)}
              onApprove={() => moderate(review, "approve")}
              onReject={() => moderate(review, "reject")}
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

      {selectedReview && (
        <ReviewModal
          key={selectedReview.id}
          review={selectedReview}
          dict={dict}
          lang={lang}
          acting={actingId === selectedReview.id}
          onClose={() => setSelectedReview(null)}
          onApprove={() => moderate(selectedReview, "approve")}
          onReject={() => moderate(selectedReview, "reject")}
        />
      )}
    </div>
  );
}

function localizedComment(review: AdminReview, lang: Locale) {
  if (lang === "de") return review.comment_de || review.comment_en;
  if (lang === "fr") return review.comment_fr || review.comment_en;
  return review.comment_en;
}

function StatusBadge({
  review,
  dict,
}: {
  review: AdminReview;
  dict: ReviewsDict;
}) {
  return (
    <Badge tone={statusTone[review.status]} dot={false}>
      {dict.statusLabels[review.status]}
    </Badge>
  );
}

function Rating({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} ${label}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`size-4 ${
            index < rating
              ? "fill-brand text-brand"
              : "fill-transparent text-border"
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-semibold text-foreground">
        {rating}
      </span>
    </div>
  );
}

function ReviewCard({
  review,
  dict,
  lang,
  acting,
  onReview,
  onApprove,
  onReject,
}: {
  review: AdminReview;
  dict: ReviewsDict;
  lang: Locale;
  acting: boolean;
  onReview: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <StatusBadge review={review} dict={dict} />
          <div>
            <p className="font-semibold text-foreground">
              {review.braider_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(review.created_at, lang)} -{" "}
              {formatTime(review.created_at, lang)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onReview}
          aria-label={`${dict.review} ${review.id}`}
          className="p-2 text-muted-foreground hover:bg-border/40 hover:text-foreground"
        >
          <Eye className="size-4" />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <Rating rating={review.rating} label={dict.star} />
        <p className="text-sm text-muted-foreground">
          {localizedComment(review, lang) || dict.noComment}
        </p>
        <p className="text-sm">
          <span className="text-muted-foreground">{dict.table.customer}: </span>
          <span className="font-medium text-foreground">
            {review.customer_name}
          </span>
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="px-3 py-2"
          onClick={onApprove}
          disabled={acting || review.status === "APPROVED"}
        >
          <Check className="size-4" />
          {dict.approve}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="px-3 py-2 text-red-600 hover:bg-red-500/10"
          onClick={onReject}
          disabled={acting || review.status === "REJECTED"}
        >
          <Trash2 className="size-4" />
          {dict.reject}
        </Button>
      </div>
    </div>
  );
}

function ReviewModal({
  review,
  dict,
  lang,
  acting,
  onClose,
  onApprove,
  onReject,
}: {
  review: AdminReview;
  dict: ReviewsDict;
  lang: Locale;
  acting: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <Modal open onClose={onClose} labelledBy="review-modal" size="lg">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="review-modal" className="text-lg font-bold">
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
          <Detail label={dict.modal.braider} value={review.braider_name} />
          <Detail label={dict.modal.customer} value={review.customer_name} />
          <Detail label={dict.modal.reviewId} value={review.id} mono />
          <Detail label={dict.modal.braiderId} value={review.braider_id} mono />
          <Detail label={dict.modal.customerId} value={review.customer_id} mono />
          <Detail
            label={dict.modal.updatedAt}
            value={`${formatDate(review.updated_at, lang)} ${formatTime(
              review.updated_at,
              lang
            )}`}
          />
        </div>

        <div className="border border-border bg-border/10 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <StatusBadge review={review} dict={dict} />
            <Rating rating={review.rating} label={dict.star} />
          </div>
          <div className="mt-4 space-y-4">
            <CommentBlock label={dict.modal.commentEn} value={review.comment_en} fallback={dict.noComment} />
            <CommentBlock label={dict.modal.commentDe} value={review.comment_de} fallback={dict.noComment} />
            <CommentBlock label={dict.modal.commentFr} value={review.comment_fr} fallback={dict.noComment} />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            className="w-auto"
            onClick={onClose}
          >
            {dict.cancel}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-auto text-red-600 hover:bg-red-500/10"
            onClick={onReject}
            disabled={acting || review.status === "REJECTED"}
          >
            <Trash2 className="size-4" />
            {dict.reject}
          </Button>
          <Button
            type="button"
            className="w-auto"
            onClick={onApprove}
            disabled={acting || review.status === "APPROVED"}
          >
            <Check className="size-4" />
            {dict.approve}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function CommentBlock({
  label,
  value,
  fallback,
}: {
  label: string;
  value: string | null;
  fallback: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
        {value || fallback}
      </p>
    </div>
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
