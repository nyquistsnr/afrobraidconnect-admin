import { Loader2 } from "lucide-react";

export function LoadingSpinner({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`}>
      <Loader2 className="size-6 animate-spin text-brand" />
      {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
    </div>
  );
}

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
