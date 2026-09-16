"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CalendarCheck, Loader2, MoreHorizontal, ShieldAlert, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { adminUsersApi } from "@/lib/api/admin-users-client";
import type { AdminUserResponse } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { getAuthErrorMessage } from "@/lib/api/error-messages";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

export function UsersTable({
  users,
  accessToken,
  lang,
  errorsDict,
  dict,
  isLoading = false,
  isFetching = false,
}: {
  users: AdminUserResponse[];
  accessToken: string;
  lang: Locale;
  errorsDict: Dictionary["common"]["errors"];
  dict: Partial<Dictionary["dashboard"]["users"]["table"]> & {
    viewBookings?: string;
  };
  isLoading?: boolean;
  /** True while existing rows are being replaced (e.g. pagination) — dims the current rows and shows a spinner instead of swapping to the skeleton. */
  isFetching?: boolean;
}) {
  const showFetchingOverlay = !isLoading && isFetching && users.length > 0;
  const router = useRouter();
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const suspendMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      return adminUsersApi.suspendUser(userId, { reason }, accessToken, lang);
    },
    onSuccess: (response) => {
      toast.success(response.status_label || "User suspended successfully.");
      setSuspendModalOpen(false);
      router.refresh();
    },
    onError: (error: unknown) => {
      toast.error(getAuthErrorMessage(errorCode(error), errorsDict));
    },
  });

  const unsuspendMutation = useMutation({
    mutationFn: async (userId: string) => {
      return adminUsersApi.unsuspendUser(userId, accessToken, lang);
    },
    onSuccess: (response) => {
      toast.success(response.status_label || "User unsuspended successfully.");
      router.refresh();
    },
    onError: (error: unknown) => {
      toast.error(getAuthErrorMessage(errorCode(error), errorsDict));
    },
  });

  function handleSuspendSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUserId) return;
    const formData = new FormData(event.currentTarget);
    const reason = String(formData.get("reason") ?? "");
    suspendMutation.mutate({ userId: selectedUserId, reason: reason || undefined });
  }

  function openSuspendModal(userId: string) {
    setSelectedUserId(userId);
    setSuspendModalOpen(true);
  }

  function bookingsHref(user: AdminUserResponse) {
    if (user.user_type === "BRAIDER") {
      return `/${lang}/dashboard/bookings/braiders/${braiderProfileId(user)}`;
    }
    if (user.user_type === "CUSTOMER") {
      return `/${lang}/dashboard/bookings/customers/${user.id}`;
    }
    return null;
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="relative hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm md:block">
        {showFetchingOverlay ? (
          <div className="absolute inset-0 z-10 flex items-start justify-center bg-background/60 pt-16">
            <Loader2 className="size-6 animate-spin text-brand" aria-hidden="true" />
          </div>
        ) : null}
        <table
          className={`w-full text-left text-sm text-foreground transition-opacity ${
            showFetchingOverlay ? "opacity-50" : "opacity-100"
          }`}
        >
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">{dict.name || "Name"}</th>
              <th className="px-6 py-3 font-medium">{dict.email || "Email"}</th>
              <th className="px-6 py-3 font-medium">{dict.role || "Role"}</th>
              <th className="px-6 py-3 font-medium">{dict.status || "Status"}</th>
              <th className="px-6 py-3 font-medium text-right">{dict.actions || "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  {Array.from({ length: 5 }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4">
                      <div className="h-3.5 w-4/5 animate-pulse rounded bg-border/60" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  {dict.empty || "No users found."}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50">
                  <td className="whitespace-nowrap px-6 py-4 font-medium">
                    {user.first_name} {user.last_name || ""}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                      {user.user_type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {user.is_active ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                        {dict.active || "Active"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
                        {dict.suspended || "Suspended"}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <DropdownMenu
                      trigger={
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      }
                    >
                      {bookingsHref(user) && (
                        <DropdownMenuItem
                          onClick={() => router.push(bookingsHref(user) || "#")}
                        >
                          <CalendarCheck className="mr-2 size-4" />
                          {dict.viewBookings || "View bookings"}
                        </DropdownMenuItem>
                      )}
                      {user.is_active ? (
                        <DropdownMenuItem
                          onClick={() => openSuspendModal(user.id)}
                          className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-900/20 dark:focus:text-red-400"
                        >
                          <ShieldAlert className="mr-2 size-4" />
                          {dict.suspendAction || "Suspend User"}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => unsuspendMutation.mutate(user.id)}>
                          <ShieldCheck className="mr-2 size-4" />
                          {dict.unsuspendAction || "Unsuspend User"}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="relative grid grid-cols-1 gap-4 md:hidden">
        {showFetchingOverlay ? (
          <div className="absolute inset-0 z-10 flex items-start justify-center bg-background/60 pt-10">
            <Loader2 className="size-6 animate-spin text-brand" aria-hidden="true" />
          </div>
        ) : null}
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`skeleton-card-${index}`}
              className="space-y-2.5 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-border/60" />
              <div className="h-3.5 w-1/2 animate-pulse rounded bg-border/60" />
              <div className="h-3.5 w-1/3 animate-pulse rounded bg-border/60" />
            </div>
          ))
        ) : users.length === 0 ? (
          <div className="rounded-lg border border-border bg-card px-6 py-8 text-center text-muted-foreground shadow-sm">
            {dict.empty || "No users found."}
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-semibold text-foreground text-base truncate">
                    {user.first_name} {user.last_name || ""}
                  </span>
                  <span className="text-sm text-muted-foreground truncate">{user.email}</span>
                </div>
                <DropdownMenu
                  trigger={
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  }
                >
                  {bookingsHref(user) && (
                    <DropdownMenuItem
                      onClick={() => router.push(bookingsHref(user) || "#")}
                    >
                      <CalendarCheck className="mr-2 size-4" />
                      {dict.viewBookings || "View bookings"}
                    </DropdownMenuItem>
                  )}
                  {user.is_active ? (
                    <DropdownMenuItem
                      onClick={() => openSuspendModal(user.id)}
                      className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-900/20 dark:focus:text-red-400"
                    >
                      <ShieldAlert className="mr-2 size-4" />
                      {dict.suspendAction || "Suspend User"}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => unsuspendMutation.mutate(user.id)}>
                      <ShieldCheck className="mr-2 size-4" />
                      {dict.unsuspendAction || "Unsuspend User"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenu>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                <span className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  {user.user_type}
                </span>
                {user.is_active ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                    {dict.active || "Active"}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
                    {dict.suspended || "Suspended"}
                  </span>
                )}
              </div>
              {bookingsHref(user) && (
                <Link
                  href={bookingsHref(user) || "#"}
                  className="inline-flex items-center justify-center gap-2 border border-border bg-input px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-border/40"
                >
                  <CalendarCheck className="size-4" />
                  {dict.viewBookings || "View bookings"}
                </Link>
              )}
            </div>
          ))
        )}
      </div>

      <Modal open={suspendModalOpen} onClose={() => setSuspendModalOpen(false)} labelledBy="suspend-user-title">
        <div className="flex flex-col gap-4">
          <h2 id="suspend-user-title" className="text-xl font-bold text-foreground">
            Suspend User
          </h2>
          <p className="text-sm text-muted-foreground">
            Suspending this user will immediately block their login and invalidate any active sessions.
          </p>
          <form onSubmit={handleSuspendSubmit} className="space-y-4">
            <Input
              label="Reason (Optional)"
              type="text"
              name="reason"
              placeholder="e.g. Fraudulent activity"
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSuspendModalOpen(false)}
                disabled={suspendMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={suspendMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white border-red-600">
                {suspendMutation.isPending ? "Suspending..." : "Suspend"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

function braiderProfileId(user: AdminUserResponse) {
  return user.braider_id || user.braider_profile_id || user.profile_id || user.id;
}

function errorCode(error: unknown) {
  return error instanceof Error ? error.message : undefined;
}
