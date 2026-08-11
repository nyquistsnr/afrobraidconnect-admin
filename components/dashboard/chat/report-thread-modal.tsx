"use client";

import { useId, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { ChatReportReason } from "@/lib/api/types";
import { chatApi } from "@/lib/api/chat-client";
import { getAuthErrorMessage } from "@/lib/api/error-messages";
import { Modal } from "@/components/ui/modal";
import { Select, type SelectOption } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const REPORT_REASONS: ChatReportReason[] = [
  "HARASSMENT",
  "INAPPROPRIATE_CONTENT",
  "SPAM",
  "SCAM_OR_FRAUD",
  "OFF_PLATFORM_SOLICITATION",
  "OTHER",
];

export function ReportThreadModal({
  open,
  onClose,
  threadId,
  messageId = null,
  accessToken,
  lang,
  dict,
  common,
}: {
  open: boolean;
  onClose: () => void;
  threadId: string;
  messageId?: string | null;
  accessToken: string;
  lang: Locale;
  dict: Dictionary["chat"]["report"];
  common: Dictionary["common"];
}) {
  const titleId = useId();
  const [reason, setReason] = useState<ChatReportReason | "">("");
  const [details, setDetails] = useState("");

  const reportMutation = useMutation({
    mutationFn: () =>
      chatApi.report(
        accessToken,
        threadId,
        { reason: reason as ChatReportReason, details: details.trim() || null, message_id: messageId },
        lang
      ),
    onSuccess: () => {
      toast.success(dict.success);
      setReason("");
      setDetails("");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(getAuthErrorMessage(error.message, common.errors));
    },
  });

  function handleClose() {
    if (reportMutation.isPending) return;
    setReason("");
    setDetails("");
    onClose();
  }

  const reasonOptions: SelectOption<ChatReportReason>[] = REPORT_REASONS.map((value) => ({
    value,
    label: dict.reasons[value],
  }));

  return (
    <Modal open={open} onClose={handleClose} labelledBy={titleId}>
      <h2 id={titleId} className="mb-4 text-lg font-semibold text-foreground">
        {dict.title}
      </h2>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!reason) return;
          reportMutation.mutate();
        }}
      >
        <Select
          label={dict.reasonLabel}
          showLabel
          value={reason}
          onChange={setReason}
          options={reasonOptions}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {dict.detailsLabel}
          </label>
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value.slice(0, 1000))}
            placeholder={dict.detailsPlaceholder}
            rows={4}
            maxLength={1000}
            className="w-full border border-border bg-input px-4 py-3 text-sm text-foreground outline-none focus:border-brand"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-auto"
            onClick={handleClose}
            disabled={reportMutation.isPending}
          >
            {dict.cancel}
          </Button>
          <Button
            type="submit"
            className="w-auto"
            disabled={!reason || reportMutation.isPending}
          >
            {reportMutation.isPending ? common.loading : dict.submit}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
