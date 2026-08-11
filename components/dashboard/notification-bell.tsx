"use client";

import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { Notification } from "@/lib/api/types";
import { notificationsApi } from "@/lib/api/notifications-client";
import { formatDate, formatTime } from "@/lib/format";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

const RECENT_PAGE_SIZE = 8;

function NotificationRow({
  notification,
  lang,
  onSelect,
}: {
  notification: Notification;
  lang: Locale;
  onSelect: (notification: Notification) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className={`flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-border/40 ${
        notification.is_read ? "" : "bg-brand/5"
      }`}
    >
      <span
        className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
          notification.is_read ? "bg-transparent" : "bg-brand"
        }`}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {notification.title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {notification.body}
        </span>
        <span className="mt-1 block text-[11px] text-muted-foreground">
          {formatDate(notification.created_at, lang)} · {formatTime(notification.created_at, lang)}
        </span>
      </span>
    </button>
  );
}

export function NotificationBell({
  lang,
  dict,
}: {
  lang: Locale;
  dict: Dictionary["dashboard"]["header"];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const queryClient = useQueryClient();

  const unreadCountQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsApi.list(accessToken!, lang, { is_read: false, page_size: 1 }),
    enabled: !!accessToken,
  });
  const unreadCount = unreadCountQuery.data?.pagination.total_items ?? 0;

  const recentQuery = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => notificationsApi.list(accessToken!, lang, { page_size: RECENT_PAGE_SIZE }),
    enabled: !!accessToken,
  });
  const notifications = recentQuery.data?.items ?? [];

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(accessToken!, id, lang),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(accessToken!, lang),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  function handleSelect(notification: Notification) {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.related_type === "chat_thread" && notification.related_id) {
      router.push(`/${lang}/dashboard/chat/${notification.related_id}`);
    }
  }

  return (
    <DropdownMenu
      className="w-80 sm:w-96"
      trigger={
        <button
          type="button"
          aria-label={dict.notifications}
          className="relative flex items-center justify-center p-2 text-muted-foreground transition-colors hover:bg-border/40 hover:text-foreground"
        >
          <Bell className="size-5" />
          {!!unreadCount && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-brand px-1 text-[10px] font-semibold leading-none text-brand-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      }
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-sm font-semibold text-foreground">{dict.notifications}</span>
        <Link href={`/${lang}/dashboard/notifications`} className="text-xs font-medium text-brand hover:underline">
          View All
        </Link>
      </div>

      <div className="max-h-80 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {recentQuery.isError ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            {dict.notificationsLoadError}
          </p>
        ) : !recentQuery.isLoading && notifications.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            {dict.notificationsEmpty}
          </p>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                lang={lang}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>

      {unreadCount > 0 && (
        <button
          type="button"
          onClick={() => markAllReadMutation.mutate()}
          disabled={markAllReadMutation.isPending}
          className="flex w-full items-center justify-center gap-1.5 border-t border-border px-4 py-2.5 text-xs font-medium text-brand transition-colors hover:bg-border/40 disabled:opacity-60"
        >
          <CheckCheck className="size-3.5" />
          {dict.markAllRead}
        </button>
      )}
    </DropdownMenu>
  );
}
