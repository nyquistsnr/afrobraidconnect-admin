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
  common,
  lang,
}: {
  dict: Dictionary["login"]; // We can reuse some strings from login/signup or generic ones. Let's assume generic admin dict strings are passed or we use what's available.
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
        <h1 className="text-2xl font-bold text-foreground">Invalid Invite Link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The invite link is missing a valid token. Please check your email and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-foreground">Accept Admin Invite</h1>
      <p className="mt-2 text-sm text-muted-foreground">Complete your account details to join as an admin.</p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <Input
          label="First Name"
          type="text"
          name="first_name"
          icon={User}
          autoComplete="given-name"
          placeholder="First Name"
          required
        />
        <Input
          label="Last Name (Optional)"
          type="text"
          name="last_name"
          icon={User}
          autoComplete="family-name"
          placeholder="Last Name"
        />
        <PasswordInput
          label={dict.passwordLabel || "Password"}
          name="password"
          autoComplete="new-password"
          placeholder={dict.passwordPlaceholder || "Create a secure password"}
          required
        />

        <Button type="submit" disabled={acceptMutation.isPending}>
          {acceptMutation.isPending ? common.loading : "Accept Invite"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">
          {dict.or || "or"}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleSignInButton
        lang={lang}
        label={dict.signInWithGoogle || "Sign in with Google"}
        successMessage={common.toasts.loginSuccess}
        errorsDict={common.errors}
        token={token}
      />
    </div>
  );
}
