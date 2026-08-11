"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { type Locale } from "@/lib/i18n";

export function Header({ dict, lang }: { dict: any; lang: string }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href={`/${lang}`} className="flex items-center">
            <Image
              src="/logo/logo.webp"
              alt="Afrobraid Connect"
              width={160}
              height={41}
              className="theme-invert"
              priority
            />
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="https://example.com/find"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {dict.header.findBraider}
            </Link>
            <Link
              href={`/${lang}/signup`}
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {dict.header.joinBraider}
            </Link>
            {session && (
              <Link
                href={`/${lang}/dashboard`}
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {dict.header.dashboard}
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher lang={lang as Locale} dropDirection="down" />
          <ThemeToggle labels={dict.common.theme} dropDirection="down" />
          
          <div className="hidden md:flex">
            {!session && (
              <Link href={`/${lang}/login`}>
                <Button variant="default" size="sm" className="bg-brand hover:bg-brand-hover text-brand-foreground">
                  {dict.header.signIn}
                </Button>
              </Link>
            )}
          </div>
          
          <button 
            className="md:hidden p-2 -mr-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background absolute top-16 left-0 right-0 shadow-lg">
          <nav className="flex flex-col p-4 space-y-4">
            <Link
              href="https://example.com/find"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {dict.header.findBraider}
            </Link>
            <Link
              href={`/${lang}/signup`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {dict.header.joinBraider}
            </Link>
            {session ? (
              <Link
                href={`/${lang}/dashboard`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {dict.header.dashboard}
              </Link>
            ) : (
              <Link
                href={`/${lang}/login`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium text-brand hover:text-brand-hover"
              >
                {dict.header.signIn}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
