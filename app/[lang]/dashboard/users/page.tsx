import { redirect } from "next/navigation";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { type Locale } from "@/lib/i18n";
import { auth } from "@/auth";
import type { AdminUserResponse } from "@/lib/api/types";
import { adminUsersApi } from "@/lib/api/admin-users-client";
import { UsersTable } from "@/components/dashboard/users/users-table";
import { UsersPagination } from "@/components/dashboard/users/users-pagination";
import Link from "next/link";
import { InviteAdminModal } from "@/components/dashboard/users/invite-admin-modal";
import { InvitesTable } from "@/components/dashboard/users/invites-table";
import type { AdminInviteResponse } from "@/lib/api/types";

export const metadata = {
  title: "User Management - Admin",
};

export default async function UsersDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  const locale = lang as Locale;
  const resolvedSearchParams = await searchParams;

  const session = await auth();
  if (!session?.accessToken || session.user.userType !== "ADMIN") {
    redirect(`/${locale}/login`);
  }

  const dict = await getDictionary(locale);

  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page, 10) : 1;
  const userType = typeof resolvedSearchParams.user_type === "string" ? resolvedSearchParams.user_type : undefined;

  let users: AdminUserResponse[] = [];
  let invites: AdminInviteResponse[] = [];
  let pagination = {
    page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  };

  try {
    if (userType === "INVITES") {
      const response = await adminUsersApi.getInvites(session.accessToken, locale, page, 10);
      invites = response.items;
      pagination = response.pagination;
    } else {
      const response = await adminUsersApi.getUsers(session.accessToken, locale, {
        page,
        page_size: 10,
        user_type: userType,
      });
      users = response.items;
      pagination = response.pagination;
    }
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }

  const usersDict = (dict.dashboard as any).users;

  const tabs = [
    { label: usersDict?.tabs?.all || "All", value: "" },
    { label: usersDict?.tabs?.admin || "Admin", value: "ADMIN" },
    { label: usersDict?.tabs?.customer || "Customer", value: "CUSTOMER" },
    { label: usersDict?.tabs?.braider || "Braider", value: "BRAIDER" },
    { label: usersDict?.tabs?.invites || "Invites", value: "INVITES" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {dict.dashboard.sidebar.users || "User Management"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dict.common.usersDescription || "Manage customers, braiders, and other admins."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <InviteAdminModal
            accessToken={session.accessToken}
            lang={locale}
            errorsDict={dict.common.errors}
            dict={usersDict?.inviteAdmin || {}}
          />
        </div>

      </div>

      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = (userType || "") === tab.value;
            return (
              <Link
                key={tab.label}
                href={tab.value ? `/${locale}/dashboard/users?user_type=${tab.value}` : `/${locale}/dashboard/users`}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
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
          accessToken={session.accessToken}
          lang={locale}
          errorsDict={dict.common.errors}
          dict={usersDict?.table || {}}
        />
      )}

      <UsersPagination
        page={pagination.page}
        totalPages={pagination.total_pages}
        hasNext={pagination.has_next}
        hasPrevious={pagination.has_previous}
        summary={(usersDict?.pagination?.summary || "Showing {start} to {end} of {total} results")
          .replace("{start}", String((pagination.page - 1) * pagination.page_size + ((users.length > 0 || invites.length > 0) ? 1 : 0)))
          .replace("{end}", String(Math.min(pagination.page * pagination.page_size, pagination.total_items)))
          .replace("{total}", String(pagination.total_items))}
        previousLabel={usersDict?.pagination?.previous || "Previous"}
        nextLabel={usersDict?.pagination?.next || "Next"}
      />
    </div>
  );
}
