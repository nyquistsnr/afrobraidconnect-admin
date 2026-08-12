"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  LogOut, 
  X,
  Users,
  Scissors,
  Settings2,
  MessageSquareWarning,
  MessageSquareText,
  Star,
  CalendarCheck,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function Sidebar({
  lang,
  dict,
  userName,
  userLogo,
  open,
  onClose,
  onLogoutClick,
}: {
  lang: Locale;
  dict: Dictionary["dashboard"]["sidebar"] & { 
    users?: string; 
    bookings?: string;
    payments?: string;
    payment?: string;
    styleCatalog?: string;
    platformSettings?: string;
    chatReports?: string;
    contactSubmissions?: string;
    reviews?: string;
    home?: string;
  };
  userName: string;
  userLogo: string | null;
  userName: string;
  userLogo: string | null;
  open: boolean;
  onClose: () => void;
  onLogoutClick: () => void;
}) {
  const pathname = usePathname();

  const [minimized, setMinimized] = useState(false);

  // Only relevant on mobile, where the sidebar is an off-canvas drawer —
  // at the lg breakpoint it's always visible and this has no effect.
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const navItems = [
    {
      href: `/${lang}/dashboard`,
      label: dict.dashboard,
      icon: LayoutDashboard,
      active: pathname === `/${lang}/dashboard`,
    },
    {
      href: `/${lang}/dashboard/users`,
      label: dict.users || "Users",
      icon: Users,
      active: pathname === `/${lang}/dashboard/users`,
    },
    {
      href: `/${lang}/dashboard/bookings`,
      label: dict.bookings || "Bookings",
      icon: CalendarCheck,
      active: pathname.startsWith(`/${lang}/dashboard/bookings`),
    },
    {
      href: `/${lang}/dashboard/payments`,
      label: dict.payments || dict.payment || "Payments",
      icon: CreditCard,
      active: pathname === `/${lang}/dashboard/payments`,
    },
    {
      href: `/${lang}/dashboard/style-catalog`,
      label: dict.styleCatalog || "Style Catalog",
      icon: Scissors,
      active: pathname === `/${lang}/dashboard/style-catalog`,
    },
    {
      href: `/${lang}/dashboard/platform-settings`,
      label: dict.platformSettings || "Platform Settings",
      icon: Settings2,
      active: pathname === `/${lang}/dashboard/platform-settings`,
    },
    {
      href: `/${lang}/dashboard/chat-reports`,
      label: dict.chatReports || "Chat Reports",
      icon: MessageSquareWarning,
      active: pathname === `/${lang}/dashboard/chat-reports`,
    },
    {
      href: `/${lang}/dashboard/contact-submissions`,
      label: dict.contactSubmissions || "Contact Us",
      icon: MessageSquareText,
      active: pathname === `/${lang}/dashboard/contact-submissions`,
    },
    {
      href: `/${lang}/dashboard/reviews`,
      label: dict.reviews || "Reviews",
      icon: Star,
      active: pathname === `/${lang}/dashboard/reviews`,
    },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full shrink-0 flex-col border-r border-border bg-surface transition-all duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${minimized ? "lg:w-20" : "w-64"}`}
      >
        <button 
          onClick={() => setMinimized(!minimized)}
          className="hidden lg:flex items-center justify-center absolute -right-3 top-8 size-6 bg-surface border border-border rounded-full text-muted-foreground shadow-sm hover:text-foreground hover:bg-border/40 z-10 transition-transform hover:scale-110"
        >
          {minimized ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
        </button>

        <div className={`flex items-center py-6 relative transition-all duration-300 ${minimized ? "lg:px-0 lg:justify-center" : "px-6 justify-between"}`}>
          <Link href={`/${lang}`} className={`transition-all duration-300 overflow-hidden flex items-center ${minimized ? "lg:w-0 lg:opacity-0" : "w-32 opacity-100"}`}>
            <Image
              src="/logo/logo.webp"
              alt="Afrobraid Connect"
              width={126}
              height={32}
              className="theme-invert transition-opacity hover:opacity-80 shrink-0"
              priority
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-1 text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className={`flex-1 space-y-1 ${minimized ? "lg:px-2 px-3" : "px-3"}`}>
          {navItems.map(({ href, label, icon: Icon, active }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              title={minimized ? label : undefined}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 py-2.5 text-sm font-medium transition-colors ${
                minimized ? "lg:justify-center px-3 lg:px-0 rounded-md" : "px-3"
              } ${
                active
                  ? "bg-brand text-brand-foreground"
                  : "text-muted-foreground hover:bg-border/40 hover:text-foreground"
              }`}
            >
              <Icon className="size-5 shrink-0" />
              <span className={`truncate transition-all duration-300 ${minimized ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"}`}>
                {label}
              </span>
            </Link>
          ))}
        </nav>

        <div className={`border-t border-border py-4 transition-all duration-300 ${minimized ? "lg:px-2 px-3" : "px-3"}`}>
          <Link
            href={`/${lang}/dashboard/profile`}
            title={minimized ? userName : undefined}
            className={`flex items-center gap-3 rounded-md py-2 transition-colors ${
              minimized ? "lg:justify-center lg:px-0 px-3" : "px-3"
            } ${
              pathname === `/${lang}/dashboard/profile`
                ? "bg-border/80 text-foreground"
                : "hover:bg-border/40"
            }`}
          >
            <Image
              src={userLogo || "/images/profile.jpg"}
              alt={userName}
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-full object-cover ring-1 ring-border"
            />
            <span className={`truncate text-sm font-semibold text-foreground transition-all duration-300 ${minimized ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"}`}>
              {userName}
            </span>
          </Link>

          <button
            type="button"
            onClick={onLogoutClick}
            title={minimized ? dict.logout : undefined}
            className={`mt-1 flex w-full items-center gap-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-border/40 hover:text-foreground rounded-md ${
              minimized ? "lg:justify-center lg:px-0 px-3" : "px-3"
            }`}
          >
            <LogOut className="size-5 shrink-0" />
            <span className={`truncate transition-all duration-300 ${minimized ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"}`}>
              {dict.logout}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
