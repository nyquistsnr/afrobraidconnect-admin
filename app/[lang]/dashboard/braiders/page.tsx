import {
  renderUserDirectoryPage,
  type UserDirectoryPageProps,
} from "@/app/[lang]/dashboard/users/user-directory-page";

export const metadata = {
  title: "Braiders - Admin",
};

export default function BraidersPage(props: UserDirectoryPageProps) {
  return renderUserDirectoryPage("braiders", props);
}
