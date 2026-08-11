import { redirect, notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../../dictionaries";
import { Locale } from "@/lib/i18n";
import { auth } from "@/auth";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { DashboardLocation } from "@/components/dashboard/location/dashboard-location";

export default async function DashboardLocationPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);
  const session = await auth();

  if (!session?.accessToken) {
    redirect(`/${lang}/login`);
  }

  // Fetch the location data
  const locationData = await onboardingApi.getServiceLocation(session.accessToken, lang as Locale).catch((error) => {
    console.error("Failed to fetch location data:", error);
    throw error;
  });

  return (
    <div className="w-full">
      <DashboardLocation
        dict={dict.onboarding.serviceLocation}
        common={dict.common}
        lang={lang as Locale}
        initialData={locationData}
      />
    </div>
  );
}
