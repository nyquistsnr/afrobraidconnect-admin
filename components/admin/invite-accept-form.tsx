"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { User, Mail } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { getAuthErrorMessage } from "@/lib/api/error-messages";
import { authApi } from "@/lib/api/auth-client";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export function InviteAcceptForm({
  dict,
  loginDict,
  common,
  lang,
}: {
  dict: any;
  loginDict: Dictionary["login"];
  common: Dictionary["common"];
  lang: Locale;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  // Since we're creating an admin account, they need to provide their name and a password.
  const acceptMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; password?: string }) => {
      if (!token) throw new Error("ADMIN_INVITE_INVALID");

      const result = await signIn("accept_invite", {
        token,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        lang,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.code ?? result.error);
      }
    },
    onSuccess: () => {
      toast.success(common.toasts.loginSuccess || "Invite accepted successfully.");
      router.push(`/${lang}/dashboard`);
    },
    onError: (error: any) => {
      toast.error(getAuthErrorMessage(error.message, common.errors));
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    acceptMutation.mutate({
      firstName: String(formData.get("first_name") ?? ""),
      lastName: String(formData.get("last_name") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
  }

  if (!token) {
    return (
      <div className="w-full text-center">
        <h1 className="text-2xl font-bold text-foreground">{dict.invalidInviteLink}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {dict.missingTokenDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-foreground">{dict.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{dict.subtitle}</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <Input
          label={dict.firstNameLabel}
          type="text"
          name="first_name"
          icon={User}
          autoComplete="given-name"
          placeholder={dict.firstNamePlaceholder}
          required
        />
        <Input
          label={dict.lastNameLabel}
          type="text"
          name="last_name"
          icon={User}
          autoComplete="family-name"
          placeholder={dict.lastNamePlaceholder}
        />
        <PasswordInput
          label={loginDict.passwordLabel || "Password"}
          name="password"
          autoComplete="new-password"
          placeholder={loginDict.passwordPlaceholder || "Create a secure password"}
          required
        />

        <Button type="submit" disabled={acceptMutation.isPending}>
          {acceptMutation.isPending ? common.loading : dict.acceptInvite}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">
          {loginDict.or || "or"}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton
        lang={lang}
        label={loginDict.signInWithGoogle || "Sign in with Google"}
        successMessage={common.toasts.loginSuccess}
        errorsDict={common.errors}
        token={token}
      />
    </div>
  );
}
