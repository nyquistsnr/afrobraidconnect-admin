import { getDictionary } from "../dictionaries";
import type { Locale } from "@/lib/i18n";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header dict={dict} lang={lang} />
      <main className="flex-1 flex flex-col py-24">
        <div className="container mx-auto px-4 sm:px-8 max-w-3xl">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-foreground mb-4">
              {dict.terms.title}
            </h1>
            <p className="text-muted-foreground font-medium">
              {dict.terms.lastUpdated}
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
            <p className="mb-10 text-lg">{dict.terms.intro}</p>

            <div className="space-y-10">
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {dict.terms.account.title}
                </h2>
                <p>{dict.terms.account.text}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {dict.terms.services.title}
                </h2>
                <p>{dict.terms.services.text}</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {dict.terms.payments.title}
                </h2>
                <p>{dict.terms.payments.text}</p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer dict={dict} lang={lang} />
    </div>
  );
}
