"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, LogOut, Menu, type LucideIcon } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { chatApi } from "@/lib/api/chat-client";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { NotificationBell } from "@/components/dashboard/notification-bell";

const THREADS_LOOKUP_PAGE_SIZE = 100;

function IconButton({
  icon: Icon,
  label,
  count,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  count?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative flex items-center justify-center p-2 text-muted-foreground transition-colors hover:bg-border/40 hover:text-foreground"
    >
      <Icon className="size-5" />
      {!!count && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-brand px-1 text-[10px] font-semibold leading-none text-brand-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}

export function DashboardHeader({
  lang,
  dict,
  themeLabels,
  onMenuClick,
  onLogoutClick,
}: {
  lang: Locale;
  dict: Dictionary["dashboard"]["header"];
  themeLabels: Dictionary["common"]["theme"];
  onMenuClick: () => void;
  onLogoutClick: () => void;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  // Approximation, not an exact total — there's no dedicated aggregate-count
  // endpoint, so this sums unread_count across the first page of threads.
  const threadsQuery = useQuery({
    queryKey: ["chat-threads", { page: 1, page_size: THREADS_LOOKUP_PAGE_SIZE }],
    queryFn: () =>
      chatApi.listThreads(accessToken!, lang, { page: 1, page_size: THREADS_LOOKUP_PAGE_SIZE }),
    enabled: !!accessToken,
  });
  const unreadMessageCount =
    threadsQuery.data?.items.reduce((sum, thread) => sum + thread.unread_count, 0) ?? 0;

  return (
    <header className="flex h-16 shrink-0 items-center gap-1 border-b border-border bg-surface px-3 sm:gap-2 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="p-2 text-muted-foreground transition-colors hover:bg-border/40 hover:text-foreground lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-0.5 sm:gap-2">
        <NotificationBell lang={lang} dict={dict} />
        <IconButton
          icon={MessageSquare}
          label={dict.messages}
          count={unreadMessageCount}
          onClick={() => router.push(`/${lang}/dashboard/chat`)}
        />

        <div className="mx-1 h-6 w-px bg-border sm:mx-2" />

        <ThemeToggle labels={themeLabels} dropDirection="down" />
        <LanguageSwitcher lang={lang} dropDirection="down" />

        <div className="mx-1 h-6 w-px bg-border sm:mx-2" />

        <IconButton icon={LogOut} label={dict.logout} onClick={onLogoutClick} />
      </div>
    </header>
  );
}
