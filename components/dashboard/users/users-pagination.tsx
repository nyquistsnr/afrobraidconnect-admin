"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";

export function UsersPagination({
  page,
  totalPages,
  hasNext,
  hasPrevious,
  summary,
  previousLabel,
  nextLabel,
}: {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  summary: string;
  previousLabel: string;
  nextLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      hasNext={hasNext}
      hasPrevious={hasPrevious}
      onPageChange={handlePageChange}
      summary={summary}
      previousLabel={previousLabel}
      nextLabel={nextLabel}
    />
  );
}
