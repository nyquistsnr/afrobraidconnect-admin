import { SkeletonCard, SkeletonLine } from "@/components/ui/loading-spinner";

export function ScopedBookingsLoading({
  withOnboarding = false,
}: {
  withOnboarding?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="h-4 w-16 animate-pulse rounded bg-border/60" />

      {withOnboarding ? (
        <div className="border border-border bg-surface shadow-sm">
          <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
            <SkeletonLine className="w-48" />
            <div className="h-8 w-40 animate-pulse rounded bg-border/60" />
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <SkeletonLine className="w-40" />
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>

      <div className="border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <SkeletonLine className="w-40" />
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonLine key={index} className="w-full" />
          ))}
        </div>
      </div>

      <div className="border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <SkeletonLine className="w-40" />
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonLine key={index} className="w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
