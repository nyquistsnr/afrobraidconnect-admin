import { SkeletonCard, SkeletonLine } from "@/components/ui/loading-spinner";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-2">
          <SkeletonLine className="w-32" />
          <div className="h-7 w-56 animate-pulse rounded bg-border/60" />
          <SkeletonLine className="w-72" />
        </div>
        <div className="flex gap-2">
          <div className="h-11 w-28 animate-pulse rounded bg-border/60" />
          <div className="h-11 w-28 animate-pulse rounded bg-border/60" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>

      <div className="border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <div className="h-4 w-40 animate-pulse rounded bg-border/60" />
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonLine key={index} className="w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
