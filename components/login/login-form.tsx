"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Mail } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { getAuthErrorMessage } from "@/lib/api/error-messages";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export function LoginForm({
  dict,
  common,
  lang,
  callbackUrl,
}: {
  dict: Dictionary["login"] & { rememberMe?: string };
  common: Dictionary["common"];
  lang: Locale;
  callbackUrl?: string | null;
}) {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string; rememberMe: boolean }) => {
      const result = await signIn("credentials", {
        ...credentials,
        rememberMe: String(credentials.rememberMe),
        lang,
        redirect: false,
      });

      // signIn() never rejects for auth failures — it resolves with an
      // error/code pair instead, so we translate that into a thrown error
      // to let TanStack Query's onError path handle it uniformly.
      if (result?.error) {
        throw new Error(result.code ?? result.error);
      }
    },
    onSuccess: async () => {
      toast.success(common.toasts.loginSuccess);
      // A validated callbackUrl (wherever the visitor was before an auth
      // guard sent them here) always wins over the default destination.
      if (callbackUrl) {
        router.push(callbackUrl);
        return;
      }
      router.push(`/${lang}/dashboard`);
    },
    onError: (error) => {
      toast.error(getAuthErrorMessage(error.message, common.errors));
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    loginMutation.mutate({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      rememberMe: formData.get("remember_me") === "on",
    });
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-foreground">{dict.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{dict.subtitle}</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <Input
          label={dict.emailLabel}
          type="email"
          name="email"
          icon={Mail}
          autoComplete="email"
          placeholder={dict.emailPlaceholder}
          required
        />

        <PasswordInput
          label={dict.passwordLabel}
          name="password"
          autoComplete="current-password"
          placeholder={dict.passwordPlaceholder}
          required
        />

        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox name="remember_me" />
            <span className="text-sm font-medium text-foreground select-none">
              {dict.rememberMe || "Remember me"}
            </span>
          </label>
        </div>

        <Button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? common.loading : dict.signIn}
        </Button>
      </form>
    </div>
  );
}
