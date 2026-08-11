import Link from "next/link";
import { Link2, MessageCircle, Share2 } from "lucide-react";

export function Footer({ dict, lang }: { dict: any; lang: string }) {
  return (
    <footer className="border-t border-border bg-surface text-muted-foreground py-12">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <Link href={`/${lang}`} className="inline-block font-bold text-xl text-brand mb-4">
              Afrobraid Connect
            </Link>
            <p className="text-sm max-w-xs mb-6">
              {dict.home.heroSubheadline}
            </p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-foreground transition-colors" aria-label="Social Link">
                <Share2 size={20} />
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors" aria-label="Social Link">
                <MessageCircle size={20} />
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors" aria-label="Social Link">
                <Link2 size={20} />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${lang}/signup`} className="hover:text-brand transition-colors">
                  {dict.header.joinBraider}
                </Link>
              </li>
              <li>
                <Link href="https://example.com/find" className="hover:text-brand transition-colors">
                  {dict.header.findBraider}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/login`} className="hover:text-brand transition-colors">
                  {dict.header.signIn}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">{dict.footer.company}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${lang}/about`} className="hover:text-brand transition-colors">
                  {dict.footer.links.aboutUs}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={`/${lang}/privacy`} className="hover:text-brand transition-colors">
                  {dict.footer.links.privacy}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/terms`} className="hover:text-brand transition-colors">
                  {dict.footer.links.terms}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/contact`} className="hover:text-brand transition-colors">
                  {dict.contact?.title || "Contact Us"}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>{dict.footer.copyright.replace("{{year}}", new Date().getFullYear().toString())}</p>
        </div>
      </div>
    </footer>
  );
}
