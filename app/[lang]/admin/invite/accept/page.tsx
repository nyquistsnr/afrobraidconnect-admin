import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { type Locale, hasLocale } from "@/lib/i18n";
import { InviteAcceptForm } from "@/components/admin/invite-accept-form";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSwitcher } from "@/components/language/language-switcher";

export const metadata = {
  title: "Accept Admin Invite - Afrobraider",
};

export default async function AdminInviteAcceptPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: paramLang } = await params;

  if (!hasLocale(paramLang)) {
    notFound();
  }
  const lang = paramLang as Locale;
  const dict = await getDictionary(lang);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Top controls */}
      <div className="absolute right-4 top-4 flex items-center gap-2 md:right-8 md:top-8">
        <LanguageSwitcher lang={lang} dropDirection="down" />
        <ThemeToggle labels={dict.common.theme} dropDirection="down" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo/logo.webp"
            alt="Afrobraid Connect"
            width={126}
            height={32}
            className="theme-invert transition-opacity hover:opacity-80"
            priority
          />
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground">{dict.common.loading}</div>}>
            <InviteAcceptForm
              dict={dict.admin.inviteAccept}
              loginDict={dict.login}
              common={dict.common}
              lang={lang}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
