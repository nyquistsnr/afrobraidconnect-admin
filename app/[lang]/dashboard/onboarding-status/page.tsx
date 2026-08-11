import { redirect, notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { Locale } from "@/lib/i18n";
import { auth } from "@/auth";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export default async function DashboardOnboardingStatusPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);
  const session = await auth();

  if (!session?.accessToken) {
    redirect(`/${lang}/login`);
  }

  const status = await onboardingApi.getStatus(session.accessToken, lang as Locale).catch((error) => {
    console.error("Failed to fetch onboarding status:", error);
    throw error;
  });

  const steps = [
    { id: "business_info", key: "business_info_completed_at", label: dict.onboarding.stepper.businessInfo, date: status.business_info_completed_at },
    { id: "phone_verification", key: "phone_verification_completed_at", label: dict.onboarding.stepper.phoneVerification, date: status.phone_verification_completed_at },
    { id: "veriff", key: "veriff_completed_at", label: dict.onboarding.stepper.veriff, date: status.veriff_completed_at },
    { id: "service_type", key: "service_type_completed_at", label: dict.onboarding.stepper.serviceType, date: status.service_type_completed_at },
    { id: "portfolio", key: "portfolio_completed_at", label: dict.onboarding.stepper.portfolio, date: status.portfolio_completed_at },
    { id: "service_location", key: "service_location_completed_at", label: dict.onboarding.stepper.serviceLocation, date: status.service_location_completed_at },
    { id: "availability", key: "availability_completed_at", label: dict.onboarding.stepper.availability, date: status.availability_completed_at },
    { id: "payment_setup", key: "payment_setup_completed_at", label: dict.onboarding.stepper.paymentSetup, date: status.payment_setup_completed_at },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Onboarding Status
        </h1>
        <p className="text-muted-foreground mt-1">
          Review your progress and see when each step was completed.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="relative border-l-2 border-border/60 ml-3 md:ml-4 space-y-8 py-2">
          {steps.map((step, index) => {
            const isCompleted = !!step.date;
            
            return (
              <div key={step.id} className="relative pl-8">
                {/* Timeline Node */}
                <div className={`absolute -left-[17px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-surface ${
                  isCompleted ? "text-green-500" : "text-border"
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 fill-green-500/10" />
                  ) : (
                    <Circle className="h-5 w-5 border-2 rounded-full border-muted-foreground/30 text-transparent" />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <h3 className={`font-medium text-base ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {isCompleted ? (
                        <span className="flex items-center gap-1.5 text-green-600/80 font-medium">
                          Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-500/80">
                          <Clock className="h-3.5 w-3.5" />
                          Pending
                        </span>
                      )}
                    </p>
                  </div>

                  {isCompleted && step.date && (
                    <div className="text-sm text-muted-foreground bg-muted/40 px-3 py-1 rounded-full border border-border/50 self-start shrink-0">
                      {new Intl.DateTimeFormat(lang, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(step.date))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {status.completed_at && (
          <div className="mt-8 pt-6 border-t border-border flex items-center justify-center text-center">
            <div className="bg-green-500/10 text-green-600 px-6 py-3 rounded-xl border border-green-500/20 w-full font-medium flex flex-col sm:flex-row items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              All Onboarding Steps Completed on {new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(new Date(status.completed_at))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
