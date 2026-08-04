"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Mail } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { getAuthErrorMessage } from "@/lib/api/error-messages";
import { onboardingStepPath } from "@/lib/onboarding";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

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
    mutationFn: async (credentials: { email: string; password: string }) => {
      const result = await signIn("credentials", {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.code ?? result.error);
      }
    },
    onSuccess: async () => {
      toast.success(common.toasts.loginSuccess);
      if (callbackUrl) {
        router.push(callbackUrl);
        return;
      }
      const session = await getSession();
      const step = session?.braider?.onboarding.current_step;
      router.push(
        step && step !== "COMPLETED"
          ? onboardingStepPath(lang, step)
          : `/${lang}/dashboard`
      );
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
    });
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl lg:text-3xl font-semibold text-foreground mb-2">
        {dict.title}
      </h1>
      <p className="text-base text-muted-foreground mb-8">
        {dict.subtitle}
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Input
            label={dict.emailLabel}
            type="email"
            name="email"
            icon={Mail}
            autoComplete="email"
            placeholder={dict.emailPlaceholder || "hello@example.com"}
            required
          />
        </div>

        <div>
          <PasswordInput
            label={dict.passwordLabel}
            name="password"
            autoComplete="current-password"
            placeholder={dict.passwordPlaceholder || "••••••••"}
            required
          />
          <div className="flex justify-end mt-2 text-sm">
            <Link
              href={`/${lang}/forgot-password`}
              className="font-medium text-brand hover:underline"
            >
              {dict.forgotPassword}
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full px-4 py-3 font-semibold text-white bg-brand hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-hover disabled:opacity-70 transition-colors"
        >
          {loginMutation.isPending ? common.loading : dict.signIn}
        </button>
      </form>

      <div className="flex items-center my-6">
        <hr className="flex-grow border-border" />
        <span className="px-4 text-sm text-muted-foreground">{dict.or}</span>
        <hr className="flex-grow border-border" />
      </div>

      <GoogleSignInButton
        lang={lang}
        label={dict.signInWithGoogle}
        successMessage={common.toasts.loginSuccess}
        errorsDict={common.errors}
        callbackUrl={callbackUrl}
      />

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          {dict.notVerified}{" "}
          <Link
            href={`/${lang}/verify-email`}
            className="font-medium text-brand hover:underline"
          >
            {dict.revalidate}
          </Link>
        </p>
      </div>
    </div>
  );
}
