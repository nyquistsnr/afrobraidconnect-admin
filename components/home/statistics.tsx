"use client";

import { useEffect, useState, useRef } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";

function parseValue(val: string) {
  const match = val.match(/(\d+)(.*)/);
  if (match) {
    return { num: parseInt(match[1], 10), suffix: match[2] };
  }
  return { num: 0, suffix: val };
}

function AnimatedNumber({ value }: { value: string }) {
  const { num, suffix } = parseValue(value);
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    
    let startTimestamp: number | null = null;
    const duration = 2000; // 2 seconds animation
    let animationFrame: number;
    let observer: IntersectionObserver;

    const startAnimation = () => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // easeOutQuart easing function for smooth deceleration
        const easeOut = 1 - Math.pow(1 - progress, 4);
        
        setCurrent(Math.floor(easeOut * num));
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(step);
        }
      };
      animationFrame = requestAnimationFrame(step);
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startAnimation();
          observer.disconnect(); // only animate once
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (observer) observer.disconnect();
    };
  }, [num]);

  return (
    <span ref={ref}>
      {current}{suffix}
    </span>
  );
}

export function Statistics({ dict }: { dict: Dictionary["home"] }) {
  return (
    <section className="py-20 bg-brand text-brand-foreground border-y border-border">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-brand-foreground/20">
          {dict.statistics.stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center py-4 md:py-0">
              <span className="text-4xl md:text-5xl font-black mb-2">
                <AnimatedNumber value={stat.value} />
              </span>
              <span className="text-lg font-medium text-brand-foreground/80 uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
