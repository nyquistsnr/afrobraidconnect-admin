import { getDictionary } from "./dictionaries";
import type { Locale } from "@/lib/i18n";
import { Header } from "@/components/layout/header";
import { Hero } from "@/components/home/hero";
import { Benefits } from "@/components/home/benefits";
import { HowItWorks } from "@/components/home/how-it-works";
import { Statistics } from "@/components/home/statistics";
import { Testimonials } from "@/components/home/testimonials";
import { Faq } from "@/components/home/faq";
import { Cta } from "@/components/home/cta";
import { Footer } from "@/components/layout/footer";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header dict={dict} lang={lang} />
      <main className="flex-1 flex flex-col">
        <Hero dict={dict} lang={lang} />
        <Benefits dict={dict.home} />
        <HowItWorks dict={dict.home} />
        <Statistics dict={dict.home} />
        <Testimonials dict={dict.home} />
        <Faq dict={dict.home} />
        <Cta dict={dict.home} lang={lang} />
      </main>
      <Footer dict={dict} lang={lang} />
    </div>
  );
}
