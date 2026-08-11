"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, SearchX } from "lucide-react";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { defaultLocale, hasLocale, type Locale } from "@/lib/i18n";

const translations: Record<
  Locale,
  {
    pageNotFound: string;
    description: string;
    goBackHome: string;
  }
> = {
  en: {
    pageNotFound: "Page not found",
    description:
      "Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.",
    goBackHome: "Go back home",
  },
  fr: {
    pageNotFound: "Page introuvable",
    description:
      "Désolé, nous n'avons pas pu trouver la page que vous cherchez. Elle a peut-être été déplacée, supprimée ou n'a jamais existé.",
    goBackHome: "Retour à l'accueil",
  },
  de: {
    pageNotFound: "Seite nicht gefunden",
    description:
      "Entschuldigung, wir konnten die gesuchte Seite nicht finden. Möglicherweise wurde sie verschoben, gelöscht oder hat nie existiert.",
    goBackHome: "Zurück zur Startseite",
  },
};

export default function NotFound() {
  const pathname = usePathname();
  const urlLang = pathname.split("/")[1];
  const lang = hasLocale(urlLang) ? urlLang : defaultLocale;
  const t = translations[lang];

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-background px-6 py-24 text-center">
      {/* Language Switcher */}
      <div className="absolute right-4 top-4 z-50 rounded-lg border border-border/50 bg-background/80 px-2 py-1 shadow-sm backdrop-blur-md">
        <LanguageSwitcher lang={lang} dropDirection="down" />
      </div>

      {/* Geometric Decorative Background Elements (sharp corners, house style) */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-[spin_20s_linear_infinite] border border-border/40 opacity-50"></div>
      <div className="absolute top-3/4 right-1/4 -z-10 h-96 w-96 translate-x-1/3 translate-y-1/4 animate-[spin_30s_linear_infinite_reverse] border border-border/30 opacity-50"></div>
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite] border-[0.5px] border-brand/5 bg-brand/5 opacity-50 blur-3xl"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Icon Container */}
        <div className="relative mb-10 flex items-center justify-center">
          <div className="absolute h-32 w-32 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] bg-brand/10"></div>
          <div className="absolute h-24 w-24 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] bg-brand/20"></div>
          <div className="relative flex h-20 w-20 items-center justify-center bg-brand text-brand-foreground shadow-2xl shadow-brand/20">
            <SearchX className="size-10" />
          </div>
        </div>

        {/* 404 Heading */}
        <h1 className="mb-4 text-7xl font-extrabold tracking-tighter text-foreground sm:text-9xl">
          4<span className="text-brand">0</span>4
        </h1>

        <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t.pageNotFound}
        </h2>

        <p className="mx-auto mb-10 max-w-md text-base text-muted-foreground sm:text-lg">
          {t.description}
        </p>

        {/* Action Button */}
        <div className="group relative">
          <div className="absolute -inset-1 animate-pulse bg-brand/20 blur transition duration-1000 group-hover:bg-brand/40 group-hover:duration-200"></div>
          <Link
            href={`/${lang}`}
            className="relative flex h-12 items-center justify-center border border-brand bg-brand px-8 text-base font-semibold text-brand-foreground transition-all hover:bg-brand-hover hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="mr-2 size-4 transition-transform group-hover:-translate-x-1" />
            {t.goBackHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
