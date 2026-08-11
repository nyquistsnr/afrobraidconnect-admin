import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale, locales } from "../dictionaries";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/forgot-password/forgot-password-form";
import { auth } from "@/auth";

export default async function ForgotPasswordPage({
  params,
}: PageProps<"/[lang]/forgot-password">) {
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
      <ForgotPasswordForm
        dict={dict.forgotPassword}
        common={dict.common}
        lang={lang}
      />
    </AuthShell>
  );
}
