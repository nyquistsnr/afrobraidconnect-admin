import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  align?: "left" | "right";
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  /** Card renderer used on narrow viewports instead of the table layout. */
  renderMobileCard: (row: T) => ReactNode;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyState?: ReactNode;
}

function SkeletonBar({ className = "" }: { className?: string }) {
  return <div className={`h-3.5 animate-pulse bg-border/60 ${className}`} />;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  onRowClick,
  renderMobileCard,
  isLoading = false,
  skeletonRows = 6,
  emptyState,
}: DataTableProps<T>) {
  const showEmpty = !isLoading && data.length === 0;

  return (
    <div className="w-full">
      {/* Desktop / tablet: real table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-border/20">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground ${
                    column.align === "right" ? "text-right" : "text-left"
                  } ${column.headerClassName ?? ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading &&
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-4">
                      <SkeletonBar className="w-4/5" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading &&
              data.map((row) => (
                <tr
                  key={getRowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={
                    onRowClick
                      ? "cursor-pointer transition-colors hover:bg-border/25"
                      : undefined
                  }
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-4 align-middle text-foreground ${
                        column.align === "right" ? "text-right" : "text-left"
                      } ${column.cellClassName ?? ""}`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>

        {showEmpty && <div className="px-4 py-12">{emptyState}</div>}
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden">
        {isLoading && (
          <ul className="space-y-3 p-3">
            {Array.from({ length: skeletonRows }).map((_, index) => (
              <li
                key={`skeleton-card-${index}`}
                className="space-y-2.5 border border-border bg-surface p-4"
              >
                <SkeletonBar className="w-2/3" />
                <SkeletonBar className="w-1/2" />
                <SkeletonBar className="w-1/3" />
              </li>
            ))}
          </ul>
        )}

        {!isLoading && data.length > 0 && (
          <ul className="space-y-3 p-3">
            {data.map((row) => (
              <li key={getRowKey(row)}>{renderMobileCard(row)}</li>
            ))}
          </ul>
        )}

        {showEmpty && <div className="px-4 py-12">{emptyState}</div>}
      </div>
    </div>
  );
}
