import type { Locale } from "@/lib/i18n";

const INTL_LOCALES: Record<Locale, string> = {
  en: "en-GB",
  fr: "fr-FR",
  de: "de-DE",
};

export function formatCurrency(
  amount: string | number,
  currency: string,
  lang: Locale
): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat(INTL_LOCALES[lang], {
    style: "currency",
    currency,
  }).format(value);
}

export function formatDate(iso: string, lang: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALES[lang], {
    dateStyle: "medium",
  }).format(new Date(iso));
}

export function formatTime(iso: string, lang: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALES[lang], {
    timeStyle: "short",
  }).format(new Date(iso));
}

// For plain "YYYY-MM-DD" values (e.g. date-only filter inputs) — formats in
// UTC so the calendar day shown never shifts with the viewer's timezone.
export function formatDateOnly(isoDate: string, lang: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALES[lang], {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
