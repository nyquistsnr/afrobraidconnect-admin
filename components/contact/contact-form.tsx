"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { User, Mail, Phone, Type, MessageSquare, ChevronDown } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import { contactApi, type ContactSubmissionRequest, ApiError } from "@/lib/api/contact-client";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { getAuthErrorMessage } from "@/lib/api/error-messages"; // Using generic error helper if needed, or fallback

export function ContactForm({
  dict,
  lang,
}: {
  dict: Dictionary["contact"];
  lang: Locale;
}) {
  const [cooldown, setCooldown] = useState<number>(0);
  const [phone, setPhone] = useState<string>("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const contactMutation = useMutation({
    mutationFn: async (data: ContactSubmissionRequest) => {
      return await contactApi.submit(data, lang);
    },
    onSuccess: (data, variables, context) => {
      // Clear the form
      const form = document.getElementById("contact-form") as HTMLFormElement;
      if (form) form.reset();
      setPhone("");
      
      toast.success(data.message || "Message sent successfully.");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.code === "RATE_LIMITED") {
          const retryAfter = error.headers?.get("Retry-After");
          if (retryAfter) {
            setCooldown(parseInt(retryAfter, 10));
          } else {
            setCooldown(60); // Default 1 min if header is missing
          }
          toast.error("You are sending messages too quickly. Please wait before trying again.");
        } else if (error.code === "VALIDATION_ERROR") {
          toast.error("Please check the form for errors and try again.");
          // Ideally map error.details to fields, but using native validation mostly
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // Using native form data mapping
    const data: ContactSubmissionRequest = {
      first_name: String(formData.get("first_name") ?? ""),
      last_name: String(formData.get("last_name") ?? ""),
      email: String(formData.get("email") ?? ""),
      ...(phone ? { phone_number: phone } : {}),
      subject: String(formData.get("subject") ?? "") || undefined,
      message: String(formData.get("message") ?? ""),
      platform: "BRAIDER",
      purpose: (formData.get("purpose") as any) || undefined,
    };
    
    contactMutation.mutate(data);
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">{dict.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{dict.subtitle}</p>

      <form id="contact-form" className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label={dict.firstNameLabel}
            type="text"
            name="first_name"
            icon={User}
            placeholder={dict.firstNamePlaceholder}
            required
          />
          <Input
            label={dict.lastNameLabel}
            type="text"
            name="last_name"
            icon={User}
            placeholder={dict.lastNamePlaceholder}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label={dict.emailLabel}
            type="email"
            name="email"
            icon={Mail}
            placeholder={dict.emailPlaceholder}
            required
          />
          <PhoneInput
            id="phone_number"
            label={dict.phoneLabel}
            lang={lang}
            value={phone}
            onChange={(val) => setPhone(val ?? "")}
            placeholder={dict.phonePlaceholder}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            {dict.purposeLabel}
          </label>
          <div className="relative">
            <select
              name="purpose"
              className="w-full appearance-none border border-border bg-input px-4 py-3 text-sm text-foreground outline-none focus:border-brand disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue="GENERAL"
            >
              <option value="GENERAL">{dict.purposeGeneral}</option>
              <option value="PARTNER">{dict.purposePartner}</option>
              <option value="PRICING">{dict.purposePricing}</option>
              <option value="FAQS">{dict.purposeFaqs}</option>
            </select>
            <ChevronDown className="absolute right-4 top-3.5 h-5 w-5 text-icon-muted pointer-events-none" />
          </div>
        </div>

        <Input
          label={dict.subjectLabel}
          type="text"
          name="subject"
          icon={Type}
          placeholder={dict.subjectPlaceholder}
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            {dict.messageLabel}
          </label>
          <div className="relative flex items-start border border-border bg-input focus-within:border-brand">
            <div className="absolute left-4 top-3.5">
              <MessageSquare className="size-5 text-icon-muted" />
            </div>
            <textarea
              name="message"
              className="flex min-h-[120px] w-full bg-transparent pl-12 pr-4 py-3.5 text-sm text-foreground outline-none resize-y placeholder:text-placeholder disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={dict.messagePlaceholder}
              required
              maxLength={5000}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={contactMutation.isPending || cooldown > 0}
        >
          {cooldown > 0 
            ? `Please wait ${cooldown}s` 
            : contactMutation.isPending 
              ? "Sending..." 
              : dict.submit}
        </Button>
      </form>
    </div>
  );
}
