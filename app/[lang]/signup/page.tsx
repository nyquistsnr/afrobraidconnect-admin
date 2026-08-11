import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale, locales } from "../dictionaries";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/signup/signup-form";
import { auth } from "@/auth";

export default async function SignupPage({
  params,
}: PageProps<"/[lang]/signup">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (session && session.error !== "RefreshAccessTokenError") {
    redirect(`/${lang}/dashboard`);
  }

  const dict = await getDictionary(lang);

  return (
    <AuthShell
      lang={lang}
      supportEmail={dict.common.supportEmail}
      heroImageAlt={dict.common.heroImageAlt}
      themeLabels={dict.common.theme}
    >
      <SignupForm dict={dict.signup} common={dict.common} lang={lang} />
    </AuthShell>
  );
}
