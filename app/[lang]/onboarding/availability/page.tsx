import { redirect } from "next/navigation";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { Locale } from "@/lib/i18n";
import { auth } from "@/auth";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { AvailabilityForm } from "@/components/onboarding/availability-form";

import { loginPath } from "@/lib/auth-redirect";

export default async function AvailabilityPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  const session = await auth();

  if (!session?.accessToken) {
    redirect(await loginPath(lang));
  }

  // Fetch all required data for the availability form concurrently
  const [settings, windows, exceptions] = await Promise.all([
    onboardingApi.getAvailabilitySettings(session.accessToken, lang),
    onboardingApi.getWeeklyWindows(session.accessToken, lang),
    onboardingApi.getExceptions(session.accessToken, lang),
  ]).catch(async (error) => {
    console.error("Failed to fetch availability data:", error);
    redirect(await loginPath(lang));
  });

  return (
    <AvailabilityForm
      dict={dict.onboarding.availability}
      common={dict.common}
      lang={lang}
      initialSettings={settings}
      initialWindows={windows}
      initialExceptions={exceptions}
    />
  );
}
