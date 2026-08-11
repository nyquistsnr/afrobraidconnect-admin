import { redirect } from "next/navigation";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { type Locale } from "@/lib/i18n";
import { auth } from "@/auth";
import type { AdminUserResponse } from "@/lib/api/types";
import { adminUsersApi } from "@/lib/api/admin-users-client";
import { UsersTable } from "@/components/dashboard/users/users-table";
import { InviteAdminModal } from "@/components/dashboard/users/invite-admin-modal";

export const metadata = {
  title: "User Management - Admin",
};

export default async function UsersDashboardPage({
  params,
  searchParams,
}: {
  params: { lang: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth();
  if (!session?.accessToken || session.user.userType !== "ADMIN") {
    redirect(`/${params.lang}/login`);
  }

  const lang = params.lang as Locale;
  const dict = await getDictionary(lang);

  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const userType = typeof searchParams.user_type === "string" ? searchParams.user_type : undefined;

  let users: AdminUserResponse[] = [];
  try {
    const response = await adminUsersApi.getUsers(session.accessToken, lang, {
      page,
      page_size: 50,
      user_type: userType,
    });
    users = response.items;
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage customers, braiders, and other admins.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <InviteAdminModal
            accessToken={session.accessToken}
            lang={lang}
            errorsDict={dict.common.errors}
          />
        </div>
      </div>

      <UsersTable
        users={users}
        accessToken={session.accessToken}
        lang={lang}
        errorsDict={dict.common.errors}
      />
    </div>
  );
}
