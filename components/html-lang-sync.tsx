"use client";

import { useLayoutEffect } from "react";
import type { Locale } from "@/lib/i18n";

export function HtmlLangSync({ lang }: { lang: Locale }) {
  useLayoutEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return null;
}
