import {
  renderUserDirectoryPage,
  type UserDirectoryPageProps,
} from "@/app/[lang]/dashboard/users/user-directory-page";

export const metadata = {
  title: "Customers - Admin",
};

export default function CustomersPage(props: UserDirectoryPageProps) {
  return renderUserDirectoryPage("customers", props);
}
