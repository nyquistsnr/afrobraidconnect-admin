"use client";

import { useState } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { ChevronDown } from "lucide-react";

export function Faq({ dict }: { dict: Dictionary["home"] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-surface border-y border-border">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {dict.faq.title}
          </h2>
          <p className="text-muted-foreground">
            {dict.faq.subtitle}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {dict.faq.items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                className="mb-4 border border-border bg-background transition-colors hover:border-brand"
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span className={`font-bold ${isOpen ? "text-brand" : "text-foreground"}`}>
                    {item.question}
                  </span>
                  <ChevronDown 
                    className={`transform transition-transform duration-200 ${isOpen ? "rotate-180 text-brand" : "text-muted-foreground"}`} 
                    size={20} 
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-muted-foreground">
                    <p className="border-t border-border/50 pt-4">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
