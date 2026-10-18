import {
  renderUserDirectoryPage,
  type UserDirectoryPageProps,
} from "@/app/[lang]/dashboard/users/user-directory-page";

export const metadata = {
  title: "Staff - Admin",
};

export default function StaffPage(props: UserDirectoryPageProps) {
  return renderUserDirectoryPage("staff", props);
}
