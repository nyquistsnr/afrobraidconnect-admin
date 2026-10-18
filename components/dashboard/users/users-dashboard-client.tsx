"use client";

import { useAccessToken } from "@/lib/access-token";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { UserCheck, UserX, Users } from "lucide-react";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { adminUsersApi } from "@/lib/api/admin-users-client";
import type {
  AdminInviteResponse,
  AdminUserResponse,
  AdminUserStatsResponse,
  PaginationMeta,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { InviteAdminModal } from "@/components/dashboard/users/invite-admin-modal";
import { InvitesTable } from "@/components/dashboard/users/invites-table";
import { UsersPagination } from "@/components/dashboard/users/users-pagination";
import { UsersTable } from "@/components/dashboard/users/users-table";

type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

export type UserDirectorySection = "staff" | "invites" | "customers" | "braiders";

const USER_TYPE_BY_SECTION: Record<Exclude<UserDirectorySection, "invites">, string> = {
  staff: "ADMIN",
  customers: "CUSTOMER",
  braiders: "BRAIDER",
};

const PAGE_SIZE = 10;

const emptyPagination = (page: number): PaginationMeta => ({
  page,
  page_size: PAGE_SIZE,
  total_items: 0,
  total_pages: 0,
  has_next: false,
  has_previous: false,
});

export function UsersDashboardClient({
  locale,
  usersDict,
  errorsDict,
  page,
  section,
}: {
  locale: Locale;
  usersDict: Dictionary["dashboard"]["users"];
  errorsDict: Dictionary["common"]["errors"];
  page: number;
  section: UserDirectorySection;
}) {
  const accessToken = useAccessToken();
  const pageDict = usersDict.pages[section];
  const statsDict = usersDict.stats;
  const isInvites = section === "invites";
  const userType = isInvites ? undefined : USER_TYPE_BY_SECTION[section];

  // Keys share the "admin-users" prefix so suspend/invite mutations can invalidate lists and stats together.
  const listQuery = useQuery({
    queryKey: ["admin-users", "list", locale, section, page],
    queryFn: async () => {
      if (isInvites) {
        const response = await adminUsersApi.getInvites(accessToken!, locale, page, PAGE_SIZE);
        return {
          users: [] as AdminUserResponse[],
          invites: response.items,
          pagination: response.pagination,
        };
      }

      const response = await adminUsersApi.getUsers(accessToken!, locale, {
        page,
        page_size: PAGE_SIZE,
        user_type: userType,
      });
      return {
        users: response.items,
        invites: [] as AdminInviteResponse[],
        pagination: response.pagination,
      };
    },
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
  });

  const statsQuery = useQuery<AdminUserStatsResponse>({
    queryKey: ["admin-users", "stats", locale, section],
    queryFn: () =>
      isInvites
        ? adminUsersApi.getInviteStats(accessToken!, locale)
        : adminUsersApi.getUserStats(accessToken!, locale, userType),
    enabled: Boolean(accessToken),
  });

  const users = listQuery.data?.users ?? [];
  const invites = listQuery.data?.invites ?? [];
  const pagination = listQuery.data?.pagination ?? emptyPagination(page);

  const visibleRows = users.length > 0 || invites.length > 0;
  const summary = (usersDict?.pagination?.summary || "Showing {start} to {end} of {total} results")
    .replace("{start}", String((pagination.page - 1) * pagination.page_size + (visibleRows ? 1 : 0)))
    .replace("{end}", String(Math.min(pagination.page * pagination.page_size, pagination.total_items)))
    .replace("{total}", String(pagination.total_items));

  const stats = [
    { label: statsDict.total, value: statsQuery.data?.total, icon: Users, tone: "bg-brand/10 text-brand" },
    {
      label: statsDict.active,
      value: statsQuery.data?.active,
      icon: UserCheck,
      tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      hint: isInvites ? statsDict.invitesActiveHint : undefined,
    },
    {
      label: statsDict.inactive,
      value: statsQuery.data?.inactive,
      icon: UserX,
      tone: "bg-red-500/10 text-red-600 dark:text-red-400",
      hint: isInvites ? statsDict.invitesInactiveHint : undefined,
    },
  ];

  const showInviteButton = Boolean(accessToken) && (section === "staff" || isInvites);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-brand">
            {usersDict?.eyebrow || "User management"}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{pageDict.title}</h1>
          <p className="text-sm text-muted-foreground">{pageDict.description}</p>
        </div>
        {showInviteButton ? (
          <div className="flex items-center gap-2">
            <InviteAdminModal
              accessToken={accessToken!}
              lang={locale}
              errorsDict={errorsDict}
              dict={usersDict?.inviteAdmin || {}}
            />
          </div>
        ) : null}
      </div>

      {listQuery.isError || statsQuery.isError ? (
        <div className="border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          {errorsDict?.generic || "Could not load this data."}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tone, hint }) => (
          <div key={label} className="border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${tone}`}>
                <Icon className="size-4" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
            </div>
            {statsQuery.isLoading ? (
              <div className="mt-4 h-8 w-16 animate-pulse rounded bg-border/60" />
            ) : (
              <p className="mt-4 text-2xl font-bold text-foreground">
                {(value ?? 0).toLocaleString(locale)}
              </p>
            )}
            {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
          </div>
        ))}
      </div>

      {isInvites ? (
        <InvitesTable invites={invites} dict={usersDict?.invitesTable || {}} />
      ) : (
        <UsersTable
          users={users}
          accessToken={accessToken ?? ""}
          lang={locale}
          errorsDict={errorsDict}
          dict={usersDict?.table || {}}
          isLoading={listQuery.isLoading}
          isFetching={listQuery.isFetching}
        />
      )}

      {listQuery.isLoading ? (
        <div className="h-4 w-48 animate-pulse rounded bg-border/60" />
      ) : (
        <UsersPagination
          page={pagination.page}
          totalPages={pagination.total_pages}
          hasNext={pagination.has_next}
          hasPrevious={pagination.has_previous}
          summary={summary}
          previousLabel={usersDict?.pagination?.previous || "Previous"}
          nextLabel={usersDict?.pagination?.next || "Next"}
          isFetching={listQuery.isFetching}
        />
      )}
    </div>
  );
}
