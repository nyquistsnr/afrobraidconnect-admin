"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
  summary: string;
  previousLabel: string;
  nextLabel: string;
  disabled?: boolean;
}

export function Pagination({
  page,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
  summary,
  previousLabel,
  nextLabel,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3.5 sm:flex-row sm:px-6">
      <p className="text-xs text-muted-foreground">{summary}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || !hasPrevious}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-1 border border-border bg-input px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-border/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-input"
        >
          <ChevronLeft className="size-3.5" />
          {previousLabel}
        </button>
        <button
          type="button"
          disabled={disabled || !hasNext}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-1 border border-border bg-input px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-border/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-input"
        >
          {nextLabel}
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
