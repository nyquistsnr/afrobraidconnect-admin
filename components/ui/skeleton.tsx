export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`h-3.5 animate-pulse rounded bg-border/60 ${className}`} />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`border border-border bg-background p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="size-8 animate-pulse rounded bg-border/60" />
        <SkeletonLine className="w-24" />
      </div>
      <div className="mt-4 h-6 w-2/3 animate-pulse rounded bg-border/60" />
    </div>
  );
}

/** Skeleton placeholder matching a chart panel's shape while its data loads. */
export function SkeletonChartPanel({ className = "" }: { className?: string }) {
  return (
    <div className={`border border-border bg-background p-4 ${className}`}>
      <SkeletonLine className="w-32" />
      <div className="mt-3 flex h-64 items-end gap-2">
        {[45, 70, 55, 85, 60, 40, 75].map((height, index) => (
          <div
            key={index}
            className="flex-1 animate-pulse rounded-t bg-border/60"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}
