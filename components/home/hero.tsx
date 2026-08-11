import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero({ dict, lang }: { dict: any; lang: string }) {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-brand/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:mix-blend-screen" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-brand-hover/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:mix-blend-screen" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-brand/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 dark:mix-blend-screen" />

      <div className="container mx-auto px-4 sm:px-8 relative z-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-brand bg-brand/10 border border-brand/20 backdrop-blur-sm">
              <Scissors size={16} />
              <span>Premium Braiding Services</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              {dict.home.heroHeadline}
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
              {dict.home.heroSubheadline}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="https://example.com/find" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-brand hover:bg-brand-hover text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:scale-105 active:scale-95 group">
                  {dict.home.ctaFind}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link href={`/${lang}/signup`} className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base border-border bg-background/50 backdrop-blur hover:bg-surface transition-all hover:scale-105 active:scale-95">
                  {dict.home.ctaJoin}
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Image Content */}
          <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none aspect-[4/5] lg:aspect-square">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 to-transparent rounded-2xl -rotate-3 scale-[1.02] transition-transform duration-500 hover:rotate-0" />
            <div className="absolute inset-0 bg-surface shadow-2xl p-2 rotate-2 transition-transform duration-500 hover:rotate-0 z-10">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src="/hero_braids.jpg"
                  alt={dict.common.heroImageAlt || "Professional Braider"}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-110"
                  priority
                />
              </div>
            </div>
            
            {/* Floating Badges */}
            <div className="absolute -bottom-6 -left-6 bg-background/80 backdrop-blur-md p-4 shadow-xl z-20 border border-border animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand/10 flex items-center justify-center text-brand font-bold text-xl">
                  5.0
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{dict.home.badgeTitle}</p>
                  <p className="text-xs text-muted-foreground">{dict.home.badgeSubtitle}</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
