import { redirect } from "next/navigation";
import { hasLocale } from "./dictionaries";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) {
    redirect("/en/login");
  }
  redirect(`/${lang}/login`);
}
