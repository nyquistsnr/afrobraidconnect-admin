import { redirect } from "next/navigation";

const SECTION_BY_USER_TYPE: Record<string, string> = {
  ADMIN: "staff",
  INVITES: "invites",
  CUSTOMER: "customers",
  BRAIDER: "braiders",
};

// The old combined Users page was split into Staff / Invites / Customers / Braiders; keep old links working.
export default async function UsersRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  const { user_type: userType } = await searchParams;
  const section = (typeof userType === "string" && SECTION_BY_USER_TYPE[userType]) || "staff";
  redirect(`/${lang}/dashboard/${section}`);
}
