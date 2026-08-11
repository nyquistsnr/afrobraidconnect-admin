import type { ReactNode } from "react";

export type BadgeTone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-border/50 text-muted-foreground",
  brand: "bg-brand/10 text-brand",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400",
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

const dotClasses: Record<BadgeTone, string> = {
  neutral: "bg-muted-foreground",
  brand: "bg-brand",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
};

export function Badge({
  tone = "neutral",
  dot = true,
  children,
  className = "",
}: {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${toneClasses[tone]} ${className}`}
    >
      {dot && <span className={`size-1.5 shrink-0 ${dotClasses[tone]}`} />}
      {children}
    </span>
  );
}
