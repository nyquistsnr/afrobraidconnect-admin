import type { Dictionary } from "@/app/[lang]/dictionaries";
import { Quote } from "lucide-react";

export function Testimonials({ dict }: { dict: Dictionary["home"] }) {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {dict.testimonials.title}
          </h2>
          <p className="text-muted-foreground">
            {dict.testimonials.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dict.testimonials.cards.map((card, idx) => (
            <div 
              key={idx} 
              className="relative border border-border bg-surface p-8 pt-12 mt-6 flex flex-col"
            >
              <div className="absolute -top-6 left-8 h-12 w-12 bg-brand text-primary-foreground flex items-center justify-center border border-brand">
                <Quote size={20} fill="currentColor" />
              </div>
              <p className="text-foreground italic mb-6 flex-1">
                "{card.quote}"
              </p>
              <div className="border-t border-border pt-4">
                <h4 className="font-bold text-foreground">{card.name}</h4>
                <p className="text-sm text-muted-foreground">{card.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
