"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Lock, ShieldAlert } from "lucide-react";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { defaultLocale, hasLocale, type Locale } from "@/lib/i18n";
import { useEffect, useState } from "react";

const translations: Record<
  Locale,
  {
    pageNotFound: string;
    description: string;
    goBackHome: string;
  }
> = {
  en: {
    pageNotFound: "System Error 404",
    description:
      "This portal is restricted or the requested resource does not exist. Please authenticate to access the administrative dashboard.",
    goBackHome: "Proceed to Login",
  },
  fr: {
    pageNotFound: "Erreur Système 404",
    description:
      "Ce portail est restreint ou la ressource demandée n'existe pas. Veuillez vous authentifier pour accéder au tableau de bord administratif.",
    goBackHome: "Procéder à la connexion",
  },
  de: {
    pageNotFound: "Systemfehler 404",
    description:
      "Dieses Portal ist eingeschränkt oder die angeforderte Ressource existiert nicht. Bitte authentifizieren Sie sich, um auf das administrative Dashboard zuzugreifen.",
    goBackHome: "Zur Anmeldung",
  },
};

export default function NotFound() {
  const pathname = usePathname();
  const urlLang = pathname.split("/")[1];
  const lang = hasLocale(urlLang) ? urlLang : defaultLocale;
  const t = translations[lang];

  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    // Initial position to center
    setMousePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground">
      {/* Dynamic Background Spotlight */}
      <div 
        className="pointer-events-none absolute z-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-brand opacity-[0.15] blur-[120px] transition-all duration-300 ease-out will-change-transform"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
      />
      
      {/* Grid Pattern overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Top Navbar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-border/40 bg-background/50 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tighter">
          <Lock className="size-5 text-brand" />
          ADMIN PORTAL
        </div>
        <LanguageSwitcher lang={lang} dropDirection="down" />
      </div>

      <div className="relative z-10 flex w-full max-w-7xl flex-col items-center px-6 lg:flex-row lg:justify-between lg:px-12">
        
        {/* Abstract Visual (Mobile First, then moves to right) */}
        <div className="mb-12 lg:hidden">
          <div className="relative flex items-center justify-center">
            <h2 className="select-none text-[8rem] font-black leading-none tracking-tighter text-transparent" style={{ WebkitTextStroke: "2px var(--brand)", opacity: 0.2 }}>
              404
            </h2>
            <div className="absolute text-[8rem] font-black leading-none tracking-tighter text-foreground" style={{ clipPath: "inset(0 0 52% 0)" }}>
              404
            </div>
            <div className="absolute text-[8rem] font-black leading-none tracking-tighter text-brand" style={{ clipPath: "inset(48% 0 0 0)", transform: "translate(5px, 3px)" }}>
              404
            </div>
            <div className="absolute top-1/2 left-[-10%] h-[2px] w-[120%] -translate-y-1/2 -rotate-3 bg-brand shadow-lg shadow-brand/50"></div>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-4 inline-flex items-center gap-2 border border-brand/30 bg-brand/10 px-3 py-1 text-sm font-medium text-brand">
            <ShieldAlert className="size-4" />
            <span>Unauthorized / Not Found</span>
          </div>
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight sm:text-7xl">
            {t.pageNotFound}.
          </h1>
          <p className="mb-10 max-w-lg text-lg text-muted-foreground sm:text-xl">
            {t.description}
          </p>
          
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:w-auto">
            <Link
              href={`/${lang}/login`}
              className="group relative flex h-14 w-full sm:w-auto items-center justify-center gap-3 border border-brand bg-brand px-8 text-base font-semibold text-brand-foreground transition-all hover:bg-brand-hover hover:scale-[1.02] active:scale-[0.98]"
            >
              {t.goBackHome}
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right Abstract Visual */}
        <div className="mt-16 hidden lg:block lg:mt-0">
          <div className="relative flex items-center justify-center">
            {/* Outline */}
            <h2 className="select-none text-[15rem] font-black leading-none tracking-tighter text-transparent" style={{ WebkitTextStroke: "2px var(--brand)", opacity: 0.2 }}>
              404
            </h2>
            {/* Top Half */}
            <div className="absolute text-[15rem] font-black leading-none tracking-tighter text-foreground" style={{ clipPath: "inset(0 0 52% 0)" }}>
              404
            </div>
            {/* Bottom Half */}
            <div className="absolute text-[15rem] font-black leading-none tracking-tighter text-brand" style={{ clipPath: "inset(48% 0 0 0)", transform: "translate(8px, 4px)" }}>
              404
            </div>
            {/* Line connecting the split */}
            <div className="absolute top-1/2 left-[-10%] h-[3px] w-[120%] -translate-y-1/2 -rotate-2 bg-brand shadow-lg shadow-brand/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
