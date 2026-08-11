import { apiFetch, ApiError } from "./http";
import type { Locale } from "@/lib/i18n";

export type ContactPlatform = "CUSTOMER" | "BRAIDER";
export type ContactPurpose = "GENERAL" | "PARTNER" | "PRICING" | "FAQS";

export interface ContactSubmissionRequest {
  first_name: string;
  last_name: string;
  phone_number?: string;
  email: string;
  subject?: string | null;
  message: string;
  platform: ContactPlatform;
  purpose?: ContactPurpose;
}

export interface ContactSubmissionResponse {
  id: string;
  message: string;
}

export const contactApi = {
  submit: (data: ContactSubmissionRequest, lang: Locale) =>
    apiFetch<ContactSubmissionResponse>("/contact", {
      method: "POST",
      body: data,
      lang,
    }),
};

export { ApiError };
