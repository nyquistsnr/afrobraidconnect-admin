import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale, locales } from "../../../dictionaries";
import { auth } from "@/auth";
import { chatApi } from "@/lib/api/chat-client";
import { usersApi } from "@/lib/api/users-client";
import { ApiError } from "@/lib/api/http";
import { ThreadView } from "@/components/dashboard/chat/thread-view";
import { ChatLocaleBanner } from "@/components/dashboard/chat/chat-locale-banner";

const THREADS_LOOKUP_PAGE_SIZE = 100;

export default async function ChatThreadPage(props: {
  params: Promise<{ lang: string; threadId: string }>;
}) {
  const { lang, threadId } = await props.params;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
    redirect(`/${lang}/login`);
  }

  const dict = await getDictionary(lang);

  let messages;
  try {
    messages = await chatApi.listMessages(session.accessToken, threadId, lang, {
      page: 1,
      page_size: 20,
    });
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.code === "CHAT_THREAD_NOT_FOUND" || error.code === "CHAT_ACCESS_DENIED")
    ) {
      notFound();
    }
    throw error;
  }

  // No GET /threads/{id} endpoint exists, only list and by-booking — look
  // the thread up in the (small, at this app's scale) thread list purely to
  // display the other participant's name in the header. Best-effort: a
  // lookup failure or a thread beyond the first page just falls back to a
  // generic header instead of blocking the page.
  const [threadsLookup, user] = await Promise.all([
    chatApi
      .listThreads(session.accessToken, lang, { page: 1, page_size: THREADS_LOOKUP_PAGE_SIZE })
      .catch(() => null),
    usersApi.getMe(session.accessToken, lang),
  ]);
  const otherParticipantName =
    threadsLookup?.items.find((thread) => thread.id === threadId)?.other_participant_name ?? null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col h-[calc(100dvh-6rem)] sm:h-[calc(100dvh-7rem)]">
      {!user.chat_locale && (
        <ChatLocaleBanner
          accessToken={session.accessToken}
          lang={lang}
          dict={dict.chat.localeBanner}
          common={dict.common}
        />
      )}

      <ThreadView
        threadId={threadId}
        otherParticipantName={otherParticipantName}
        initialData={messages}
        lang={lang}
        dict={dict.chat}
        common={dict.common}
        currentUserId={session.user.id}
        currentChatLocale={user.chat_locale}
      />
    </div>
  );
}
