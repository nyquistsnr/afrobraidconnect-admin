"use client";

import type { ComponentProps } from "react";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { SkeletonLine } from "@/components/ui/skeleton";
import { usersApi } from "@/lib/api/users-client";
import { useAccessToken } from "@/lib/access-token";
import type { Locale } from "@/lib/i18n";
import { adminKeys } from "@/lib/query-keys";
import { useAdminQuery } from "@/lib/use-admin-query";

type ProfileFormProps = ComponentProps<typeof ProfileForm>;

export const profileQueryKey = (lang: Locale) => [...adminKeys.profile, lang];

export function ProfilePageClient({
  logoUrl,
  dict,
  common,
  lang,
}: Pick<ProfileFormProps, "logoUrl" | "dict" | "common" | "lang">) {
  const accessToken = useAccessToken();
  const query = useAdminQuery(profileQueryKey(lang), (token) => usersApi.getMe(token, lang));

  if (query.isPending) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonLine key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!query.data) {
    return <p className="text-sm text-muted-foreground">{common.errors?.generic || "Could not load this data."}</p>;
  }

  return (
    <ProfileForm
      key={query.dataUpdatedAt}
      user={query.data}
      logoUrl={logoUrl}
      dict={dict}
      common={common}
      accessToken={accessToken ?? ""}
      lang={lang}
    />
  );
}
