"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { getAuthErrorMessage } from "@/lib/api/error-messages";
import { onboardingStepPath } from "@/lib/onboarding";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    __googleAccountsInitialized?: boolean;
    __googleSignInCallback?: (response: { credential: string }) => void;
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { size: "large" | "medium" | "small"; width: number }
          ) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({
  lang,
  label,
  successMessage,
  errorsDict,
  callbackUrl,
}: {
  lang: Locale;
  label: string;
  successMessage: string;
  errorsDict: Dictionary["common"]["errors"];
  callbackUrl?: string | null;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const googleSignInMutation = useMutation({
    mutationFn: async (providerToken: string) => {
      const result = await signIn("google", { providerToken, redirect: false });
      if (result?.error) {
        throw new Error(result.code ?? result.error);
      }
    },
    onSuccess: async () => {
      toast.success(successMessage);
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
      toast.error(getAuthErrorMessage(error.message, errorsDict));
    },
  });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let cancelled = false;

    function renderWhenReady() {
      if (cancelled) return;
      const container = containerRef.current;
      const wrapper = wrapperRef.current;
      const google = window.google;

      if (!google || !container || !wrapper) {
        setTimeout(renderWhenReady, 100);
        return;
      }

      window.__googleSignInCallback = (response) => googleSignInMutation.mutate(response.credential);

      if (!window.__googleAccountsInitialized) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID as string,
          callback: (response) => window.__googleSignInCallback?.(response),
        });
        window.__googleAccountsInitialized = true;
      }

      google.accounts.id.renderButton(container, {
        size: "large",
        width: wrapper.offsetWidth || 320,
      });
    }

    renderWhenReady();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        type="button"
        onClick={() => {
          if (!GOOGLE_CLIENT_ID) {
            toast.info("Google Sign-In is not configured yet.");
          }
        }}
        className="flex h-11 w-full items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
      >
        <GoogleIcon className="size-5 shrink-0" />
        {label}
      </button>

      {GOOGLE_CLIENT_ID && (
        <div
          ref={containerRef}
          className="absolute inset-0 overflow-hidden opacity-0 cursor-pointer"
        />
      )}
    </div>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 48 48" className="size-5">
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}
