import Image from "next/image";
import { Mail } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function AuthShell({
  lang,
  supportEmail,
  heroImageAlt,
  heroImageSrc = "/images/hero.png",
  heroImagePosition = "object-[center_12%]",
  themeLabels,
  children,
}: {
  lang: Locale;
  supportEmail: string;
  heroImageAlt: string;
  heroImageSrc?: string;
  heroImagePosition?: string;
  themeLabels: Record<"light" | "dark" | "system", string>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 bg-background">
      {/* Left Form Column */}
      <div className="flex w-full flex-col justify-between px-6 py-10 sm:px-10 lg:w-1/2 lg:px-16 xl:px-24">
        <div />

        <div className="mx-auto w-full max-w-md my-auto py-6">{children}</div>

        <div className="mx-auto flex w-full max-w-md flex-col-reverse items-center gap-4 pt-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <a
            href={`mailto:${supportEmail}`}
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            <Mail className="size-4" />
            {supportEmail}
          </a>
          <div className="flex items-center gap-3">
            <ThemeToggle labels={themeLabels} />
            <LanguageSwitcher lang={lang} />
          </div>
        </div>
      </div>

      {/* Right Column - Viewport-fitted hero image */}
      <div className="relative hidden lg:block lg:w-1/2 border-l border-border bg-background">
        <Image
          src={heroImageSrc}
          alt={heroImageAlt}
          fill
          priority
          sizes="50vw"
          className={`object-cover ${heroImagePosition}`}
        />
      </div>
    </div>
  );
}
