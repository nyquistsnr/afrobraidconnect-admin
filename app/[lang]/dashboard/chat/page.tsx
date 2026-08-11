import { notFound, redirect } from "next/navigation";
import { getDictionary, hasLocale, locales } from "../../dictionaries";
import { auth } from "@/auth";
import { chatApi } from "@/lib/api/chat-client";
import { usersApi } from "@/lib/api/users-client";
import { ThreadList } from "@/components/dashboard/chat/thread-list";
import { ChatLocaleBanner } from "@/components/dashboard/chat/chat-locale-banner";

export default async function ChatPage(props: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await props.params;

  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
    redirect(`/${lang}/login`);
  }

  const dict = await getDictionary(lang);

  const [threads, user] = await Promise.all([
    chatApi.listThreads(session.accessToken, lang, { page: 1, page_size: 20 }),
    usersApi.getMe(session.accessToken, lang),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {dict.chat.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.chat.inbox.subtitle}
        </p>
      </div>

      {!user.chat_locale && (
        <ChatLocaleBanner
          accessToken={session.accessToken}
          lang={lang}
          dict={dict.chat.localeBanner}
          common={dict.common}
        />
      )}

      <ThreadList dict={dict.chat.inbox} lang={lang} initialData={threads} />
    </div>
  );
}
