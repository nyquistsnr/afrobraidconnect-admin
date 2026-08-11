"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Languages } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { localeNames, locales } from "@/lib/i18n";
import { usersApi } from "@/lib/api/users-client";
import { getAuthErrorMessage } from "@/lib/api/error-messages";
import { Select, type SelectOption } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Shown in the chat inbox/thread views until the user sets chat_locale —
// translation silently does nothing until both sides of a conversation have
// set it, so we prompt the first time they open chat (per the API docs).
export function ChatLocaleBanner({
  accessToken,
  lang,
  dict,
  common,
}: {
  accessToken: string;
  lang: Locale;
  dict: Dictionary["chat"]["localeBanner"];
  common: Dictionary["common"];
}) {
  const router = useRouter();
  const [value, setValue] = useState<Locale | "">("");

  const saveMutation = useMutation({
    mutationFn: () => usersApi.updateMe(accessToken, { chat_locale: value }, lang),
    onSuccess: () => {
      toast.success(dict.success);
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error.message, common.errors));
    },
  });

  const options: SelectOption<Locale>[] = locales.map((locale) => ({
    value: locale,
    label: localeNames[locale],
  }));

  return (
    <div className="mb-4 flex flex-col gap-4 rounded-xl border border-border bg-brand/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-start gap-3 sm:pr-4">
        <Languages className="mt-0.5 size-5 shrink-0 text-brand" />
        <div>
          <p className="text-sm font-semibold text-foreground">{dict.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{dict.description}</p>
        </div>
      </div>

      <div className="flex w-full shrink-0 items-center gap-3 sm:w-auto">
        <div className="flex-1 sm:w-48 sm:flex-none">
          <Select
            label={dict.placeholder}
            value={value}
            onChange={setValue}
            placeholder={dict.placeholder}
            options={options}
          />
        </div>
        <Button
          type="button"
          className="!w-auto shrink-0"
          disabled={!value || saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {dict.save}
        </Button>
      </div>
    </div>
  );
}
