"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground mb-4"
    >
      <ArrowLeft className="size-4" />
      {label}
    </button>
  );
}
