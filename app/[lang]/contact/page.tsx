import { notFound } from "next/navigation";
import { getDictionary, hasLocale, locales } from "../dictionaries";
import type { Locale } from "@/lib/i18n";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ContactForm } from "@/components/contact/contact-form";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header dict={dict} lang={lang} />
      
      <main className="flex-1 flex flex-col justify-center py-16 px-4 sm:px-8 bg-surface">
        <ContactForm dict={dict.contact} lang={lang} />
      </main>

      <Footer dict={dict} lang={lang} />
    </div>
  );
}
