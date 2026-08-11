import Image from "next/image";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import {
  Building,
  Smartphone,
  ShieldCheck,
  Scissors,
  Image as ImageIcon,
  MapPin,
  CalendarDays,
  CreditCard,
} from "lucide-react";

export function HowItWorks({ dict }: { dict: Dictionary["home"] }) {
  const steps = [
    { key: "step1", icon: Building },
    { key: "step2", icon: Smartphone },
    {
      key: "step3",
      icon: ShieldCheck,
      logo: "/veriff-logo/veriff-seeklogo.svg",
      logoAlt: "Veriff Logo",
    },
    { key: "step4", icon: Scissors },
    { key: "step5", icon: ImageIcon },
    { key: "step6", icon: MapPin },
    { key: "step7", icon: CalendarDays },
    {
      key: "step8",
      icon: CreditCard,
      logo: "/stripe-logo/stripe-seeklogo.svg",
      logoAlt: "Stripe Logo",
    },
  ] as const;

  return (
    <section className="py-20 bg-surface border-y border-border">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {dict.howItWorks.title}
          </h2>
          <p className="text-muted-foreground">{dict.howItWorks.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const stepDict =
              dict.howItWorks.steps[
                step.key as keyof typeof dict.howItWorks.steps
              ];

            return (
              <div
                key={step.key}
                className="relative bg-background border border-border p-6 flex flex-col h-full"
              >
                {/* Step Number Badge */}
                <div className="absolute -top-3 -left-3 h-8 w-8 bg-brand text-primary-foreground flex items-center justify-center font-bold text-sm z-10 border border-brand shadow-sm">
                  {index + 1}
                </div>

                <div className="mb-4 text-brand">
                  <Icon size={28} />
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">
                  {stepDict.title}
                </h3>

                <p className="text-sm text-muted-foreground flex-1">
                  {stepDict.description}
                </p>

                {/* Partner Logos */}
                {"logo" in step && step.logo && (
                  <div className="mt-6 pt-4 border-t border-border flex items-center">
                    <span className="text-xs text-muted-foreground mr-3 uppercase tracking-wider font-semibold">
                      Partner
                    </span>
                    <Image
                      src={step.logo as string}
                      alt={(step as any).logoAlt}
                      width={120}
                      height={40}
                      className="h-10 w-auto object-contain"
                    />
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
