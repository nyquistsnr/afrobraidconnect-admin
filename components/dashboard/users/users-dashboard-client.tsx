"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { adminUsersApi } from "@/lib/api/admin-users-client";
import type { AdminInviteResponse, AdminUserResponse, PaginationMeta } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { InviteAdminModal } from "@/components/dashboard/users/invite-admin-modal";
import { InvitesTable } from "@/components/dashboard/users/invites-table";
import { UsersPagination } from "@/components/dashboard/users/users-pagination";
import { UsersTable } from "@/components/dashboard/users/users-table";

type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

const emptyPagination = (page: number): PaginationMeta => ({
  page,
  page_size: 10,
  total_items: 0,
  total_pages: 0,
  has_next: false,
  has_previous: false,
});

export function UsersDashboardClient({
  locale,
  dict,
  page,
  userType,
}: {
  locale: Locale;
  dict: Dictionary;
  page: number;
  userType?: string;
}) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const usersDict = dict.dashboard.users;
  const listQuery = useQuery({
    queryKey: ["admin-users", locale, page, userType ?? ""],
    queryFn: async () => {
      if (userType === "INVITES") {
        const response = await adminUsersApi.getInvites(accessToken!, locale, page, 10);
        return {
          users: [] as AdminUserResponse[],
          invites: response.items,
          pagination: response.pagination,
        };
      }

      const response = await adminUsersApi.getUsers(accessToken!, locale, {
        page,
        page_size: 10,
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

  const users = listQuery.data?.users ?? [];
  const invites = listQuery.data?.invites ?? [];
  const pagination = listQuery.data?.pagination ?? emptyPagination(page);
  const tabs = [
    { label: usersDict?.tabs?.all || "All", value: "" },
    { label: usersDict?.tabs?.admin || "Admin", value: "ADMIN" },
    { label: usersDict?.tabs?.customer || "Customer", value: "CUSTOMER" },
    { label: usersDict?.tabs?.braider || "Braider", value: "BRAIDER" },
    { label: usersDict?.tabs?.invites || "Invites", value: "INVITES" },
  ];

  const visibleRows = users.length > 0 || invites.length > 0;
  const summary = (usersDict?.pagination?.summary || "Showing {start} to {end} of {total} results")
    .replace("{start}", String((pagination.page - 1) * pagination.page_size + (visibleRows ? 1 : 0)))
    .replace("{end}", String(Math.min(pagination.page * pagination.page_size, pagination.total_items)))
    .replace("{total}", String(pagination.total_items));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-brand">
            {usersDict?.eyebrow || "User management"}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {usersDict?.title || dict.dashboard.sidebar.users || "User Management"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dict.common.usersDescription || "Manage customers, braiders, and other admins."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {accessToken ? (
            <InviteAdminModal
              accessToken={accessToken}
              lang={locale}
              errorsDict={dict.common.errors}
              dict={usersDict?.inviteAdmin || {}}
            />
          ) : null}
        </div>
      </div>

      {listQuery.isError ? (
        <div className="border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          {dict.common.errors?.generic || "Could not load this data."}
        </div>
      ) : null}

      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = (userType || "") === tab.value;
            return (
              <Link
                key={tab.label}
                href={tab.value ? `/${locale}/dashboard/users?user_type=${tab.value}` : `/${locale}/dashboard/users`}
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                  isActive
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {userType === "INVITES" ? (
        <InvitesTable invites={invites} dict={usersDict?.invitesTable || {}} />
      ) : (
        <UsersTable
          users={users}
          accessToken={accessToken ?? ""}
          lang={locale}
          errorsDict={dict.common.errors}
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
