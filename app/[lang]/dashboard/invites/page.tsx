import {
  renderUserDirectoryPage,
  type UserDirectoryPageProps,
} from "@/app/[lang]/dashboard/users/user-directory-page";

export const metadata = {
  title: "Invites - Admin",
};

export default function InvitesPage(props: UserDirectoryPageProps) {
  return renderUserDirectoryPage("invites", props);
}
