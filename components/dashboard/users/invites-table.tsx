"use client";

import type { AdminInviteResponse } from "@/lib/api/types";

export function InvitesTable({
  invites,
  dict,
}: {
  invites: AdminInviteResponse[];
  dict: any;
}) {
  function getStatusClasses(status: string) {
    switch (status) {
      case "PENDING":
        return "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20";
      case "ACCEPTED":
        return "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20";
      case "EXPIRED":
        return "bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20";
      case "REVOKED":
        return "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20";
      default:
        return "bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20";
    }
  }

  function renderStatusLabel(status: string) {
    return dict.statusLabels?.[status] || status;
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm md:block">
        <table className="w-full text-left text-sm text-foreground">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium">{dict.email || "Email"}</th>
              <th className="px-6 py-3 font-medium">{dict.status || "Status"}</th>
              <th className="px-6 py-3 font-medium">{dict.invitedOn || "Invited On"}</th>
              <th className="px-6 py-3 font-medium">{dict.expiresOn || "Expires On"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invites.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  {dict.empty || "No invites found."}
                </td>
              </tr>
            ) : (
              invites.map((invite) => (
                <tr key={invite.id} className="hover:bg-muted/50">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                    {invite.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusClasses(
                        invite.status
                      )}`}
                    >
                      {renderStatusLabel(invite.status)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                    {formatDate(invite.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                    {formatDate(invite.expires_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {invites.length === 0 ? (
          <div className="rounded-lg border border-border bg-card px-6 py-8 text-center text-muted-foreground shadow-sm">
            {dict.empty || "No invites found."}
          </div>
        ) : (
          invites.map((invite) => (
            <div
              key={invite.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-semibold text-foreground text-base truncate">
                    {invite.email}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {dict.invitedOn || "Invited"}: {formatDate(invite.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                <span className="text-sm text-muted-foreground">
                  {dict.expiresOn || "Expires"}: {formatDate(invite.expires_at)}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusClasses(
                    invite.status
                  )}`}
                >
                  {renderStatusLabel(invite.status)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
