import Link from "next/link";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { ArrowRight } from "lucide-react";

export function Cta({ dict, lang }: { dict: Dictionary["home"]; lang: string }) {
  return (
    <section className="py-24 bg-brand text-brand-foreground relative overflow-hidden">
      {/* Abstract Background pattern or shape (optional but adds premium feel) */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-8 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-6 max-w-3xl mx-auto leading-tight">
          {dict.cta.title}
        </h2>
        <p className="text-lg md:text-xl text-brand-foreground/90 mb-10 max-w-2xl mx-auto">
          {dict.cta.subtitle}
        </p>
        <Link 
          href={`/${lang}/signup`} 
          className="inline-flex items-center justify-center gap-2 border border-brand-foreground text-brand-foreground hover:bg-brand-foreground hover:text-brand px-8 py-4 text-lg font-bold transition-colors"
        >
          {dict.cta.button}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}
