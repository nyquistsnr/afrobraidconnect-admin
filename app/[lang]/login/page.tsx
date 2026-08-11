import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale, locales } from "../dictionaries";
import { sanitizeCallbackUrl } from "@/lib/callback-url";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/login/login-form";
import { auth } from "@/auth";

export default async function LoginPage({
  params,
  searchParams,
}: PageProps<"/[lang]/login">) {
  const { lang } = await params;
  const { callbackUrl } = await searchParams;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (session && session.error !== "RefreshAccessTokenError") {
    redirect(`/${lang}/dashboard`);
  }

  const dict = await getDictionary(lang);
  const safeCallbackUrl = sanitizeCallbackUrl(
    typeof callbackUrl === "string" ? callbackUrl : null
  );

  return (
    <AuthShell
      lang={lang}
      supportEmail={dict.common.supportEmail}
      heroImageAlt={dict.common.heroImageAlt}
      themeLabels={dict.common.theme}
    >
      <LoginForm
        dict={dict.login}
        common={dict.common}
        lang={lang}
        callbackUrl={safeCallbackUrl}
      />
    </AuthShell>
  );
}
