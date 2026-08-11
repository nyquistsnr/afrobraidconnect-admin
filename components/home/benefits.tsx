import type { Dictionary } from "@/app/[lang]/dictionaries";
import { DollarSign, Clock, TrendingUp } from "lucide-react";

export function Benefits({ dict }: { dict: Dictionary["home"] }) {
  const icons = [DollarSign, Clock, TrendingUp];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {dict.benefits.title}
          </h2>
          <p className="text-muted-foreground">
            {dict.benefits.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dict.benefits.cards.map((card, idx) => {
            const Icon = icons[idx];
            return (
              <div 
                key={idx} 
                className="group relative border border-border bg-surface p-8 transition-colors hover:border-brand"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center bg-brand/10 text-brand">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {card.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {card.description}
                </p>
                <div className="absolute inset-0 border-2 border-transparent transition-colors group-hover:border-brand pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
