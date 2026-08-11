import { getDictionary } from "../dictionaries";
import type { Locale } from "@/lib/i18n";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default async function AboutPage({
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
        <div className="container mx-auto px-4 sm:px-8 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black text-brand mb-16 text-center">
            {dict.about.title}
          </h1>

          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {dict.about.storyTitle}
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p>{dict.about.storyText}</p>
            </div>
          </div>

          <div className="bg-surface border border-border p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-brand"></div>
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {dict.about.missionTitle}
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p className="text-xl font-medium text-foreground/90 italic">
                "{dict.about.missionText}"
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer dict={dict} lang={lang} />
    </div>
  );
}
