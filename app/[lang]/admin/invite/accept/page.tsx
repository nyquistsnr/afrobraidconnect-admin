import { notFound } from "next/navigation";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { type Locale, hasLocale } from "@/lib/i18n";
import { InviteAcceptForm } from "@/components/admin/invite-accept-form";
import Image from "next/image";

export const metadata = {
  title: "Accept Admin Invite - Afrobraider",
};

export default async function AdminInviteAcceptPage({
  params,
}: {
  params: { lang: string };
}) {
  if (!hasLocale(params.lang)) {
    notFound();
  }
  const lang = params.lang as Locale;
  const dict = await getDictionary(lang);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
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
          <InviteAcceptForm
            dict={dict.login} // Using login dict as fallback for strings
            common={dict.common}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
}
