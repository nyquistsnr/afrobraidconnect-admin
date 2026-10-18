import { redirect } from "next/navigation";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { getSession } from "@/lib/session";
import { ProfilePageClient } from "@/components/dashboard/profile-page-client";
import type { Locale } from "@/lib/i18n";

export default async function ProfilePage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const session = await getSession();

  if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
    redirect(`/${lang}/login`);
  }

  const dict = await getDictionary(lang);

  return (
    <div className="mx-auto max-w-2xl pt-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {dict.dashboard.profile.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.dashboard.profile.subtitle}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        {/* The profile is loaded and cached client-side (TanStack Query). */}
        <ProfilePageClient
          logoUrl={session.braider?.logo_url ?? null}
          dict={dict.dashboard.profile}
          common={dict.common}
          lang={lang}
        />
      </div>
    </div>
  );
}
