import { SkeletonLine } from "@/components/ui/loading-spinner";

function DetailPanel({ rows = 4 }: { rows?: number }) {
  return (
    <div className="border border-border bg-surface p-4 shadow-sm">
      <SkeletonLine className="w-32" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="space-y-1.5">
            <SkeletonLine className="w-20" />
            <SkeletonLine className="w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-16 animate-pulse rounded bg-border/60" />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-2">
          <SkeletonLine className="w-28" />
          <div className="h-7 w-48 animate-pulse rounded bg-border/60" />
          <SkeletonLine className="w-36" />
        </div>
        <div className="h-6 w-24 animate-pulse rounded bg-border/60" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailPanel rows={6} />
        <DetailPanel rows={6} />
      </div>

      <DetailPanel rows={3} />

      <div className="grid gap-4 xl:grid-cols-2">
        <DetailPanel rows={4} />
        <DetailPanel rows={4} />
      </div>
    </div>
  );
}
