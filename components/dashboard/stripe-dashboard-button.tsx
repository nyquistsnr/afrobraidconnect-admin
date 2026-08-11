"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { useSession } from "next-auth/react";
import { Locale } from "@/lib/i18n";

interface StripeDashboardButtonProps {
  lang: Locale;
  dict?: any;
}

export function StripeDashboardButton({ lang, dict }: StripeDashboardButtonProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenStripe = async () => {
    if (!session?.accessToken) return;
    try {
      setIsLoading(true);
      const res = await onboardingApi.createDashboardLink(session.accessToken, lang);
      if (res.dashboard_url) {
        window.open(res.dashboard_url, "_blank");
      } else {
        throw new Error("No dashboard URL returned");
      }
    } catch (error: any) {
      console.error("Failed to fetch Stripe dashboard link:", error);
      alert(dict?.error || "Failed to open Stripe Dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleOpenStripe}
      disabled={isLoading}
      variant="outline"
      className="flex w-full h-11 items-center justify-center sm:justify-start gap-2 bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm transition-all rounded-xl px-4"
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin text-slate-400" />
          <span className="text-sm font-medium">{dict?.loading || "Opening..."}</span>
        </>
      ) : (
        <>
          <span className="text-sm font-medium">{dict?.viewStripeDashboard || "View Stripe Dashboard"}</span>
          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold hidden sm:inline-block ml-1">Powered by</span>
          <Image 
            src="/stripe-logo/stripe-logo.webp" 
            alt="Stripe" 
            width={44} 
            height={20} 
            className="object-contain" 
          />
          <ExternalLink className="size-3.5 opacity-50 ml-1" />
        </>
      )}
    </Button>
  );
}
