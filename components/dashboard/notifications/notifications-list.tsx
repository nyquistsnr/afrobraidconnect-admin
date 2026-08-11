"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Trash2, Loader2, MessageSquare } from "lucide-react";
import { toast } from "react-toastify";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { Notification } from "@/lib/api/types";
import { notificationsApi } from "@/lib/api/notifications-client";
import { formatDate, formatTime } from "@/lib/format";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "unread";

export function NotificationsList({
  lang,
  dict,
  common,
}: {
  lang: Locale;
  dict: Dictionary["dashboard"]["header"];
  common: Dictionary["common"];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<FilterType>("all");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["notifications", "list", filter],
    queryFn: ({ pageParam = 1 }) =>
      notificationsApi.list(accessToken!, lang, {
        page: pageParam,
        page_size: 20,
        is_read: filter === "unread" ? false : undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_next ? lastPage.pagination.page + 1 : undefined,
    enabled: !!accessToken,
  });

  const notifications = data?.pages.flatMap((page) => page.items) ?? [];

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(accessToken!, id, lang),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(accessToken!, lang),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.remove(accessToken!, id, lang),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(dict.notifications || "Notification removed"); // fallback
    },
  });

  function handleSelect(notification: Notification) {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.related_type === "chat_thread" && notification.related_id) {
      router.push(`/${lang}/dashboard/chat/${notification.related_id}`);
    }
  }

  function getNotificationIcon(type: string) {
    if (type.includes("CHAT")) {
      return <MessageSquare className="size-5 text-brand" />;
    }
    return <Bell className="size-5 text-brand" />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{dict.notifications}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Stay updated on your recent activity.</p>
        </div>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => markAllReadMutation.mutate()}
          disabled={markAllReadMutation.isPending || notifications.length === 0}
          className="shrink-0 sm:w-auto"
        >
          <CheckCheck className="size-4" />
          {dict.markAllRead}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        {/* Filter Tabs */}
        <div className="flex items-center gap-6 border-b border-border bg-muted/20 px-6 pt-4">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              filter === "all" ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              filter === "unread" ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Unread
          </button>
        </div>

        {/* Notifications List */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex h-[400px] items-center justify-center">
              <Loader2 className="size-6 animate-spin text-brand" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-muted-foreground">{dict.notificationsLoadError}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Bell className="size-12 text-muted-foreground/20 mb-4" />
              <p className="text-base font-semibold text-foreground">You're all caught up!</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === "unread" ? "You have no unread notifications." : dict.notificationsEmpty}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group flex items-start gap-4 p-5 transition-colors hover:bg-muted/30 ${
                    notification.is_read ? "bg-transparent" : "bg-brand/5"
                  }`}
                >
                  {/* Icon */}
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface shadow-sm border border-border">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content (Clickable) */}
                  <div
                    className="flex-1 cursor-pointer min-w-0 pt-0.5"
                    onClick={() => handleSelect(notification)}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className={`truncate text-sm font-semibold ${notification.is_read ? "text-foreground" : "text-brand"}`}>
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <span className="flex size-2 rounded-full bg-brand" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2 pr-4">
                      {notification.body}
                    </p>
                    <span className="mt-2 block text-xs font-medium text-muted-foreground/70">
                      {formatDate(notification.created_at, lang)} at {formatTime(notification.created_at, lang)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(notification.id);
                      }}
                      className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {hasNextPage && (
          <div className="border-t border-border bg-muted/10 p-4 flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {common.loading}
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
