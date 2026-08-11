"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Mail, Plus } from "lucide-react";
import { authApi } from "@/lib/api/auth-client";
import type { Locale } from "@/lib/i18n";
import { getAuthErrorMessage } from "@/lib/api/error-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export function InviteAdminModal({
  accessToken,
  lang,
  errorsDict,
  dict,
}: {
  accessToken: string;
  lang: Locale;
  errorsDict: any;
  dict: any;
}) {
  const [open, setOpen] = useState(false);

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      return authApi.inviteAdmin(accessToken, { email }, lang);
    },
    onSuccess: (data) => {
      toast.success(data.message || dict.success);
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || getAuthErrorMessage(error.code, errorsDict));
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    inviteMutation.mutate(String(formData.get("email") ?? ""));
  }

  return (
    <>
      <Button className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        {dict.button}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} labelledBy="invite-admin-title">
        <div className="flex flex-col gap-4">
          <h2 id="invite-admin-title" className="text-xl font-bold text-foreground">
            {dict.modalTitle}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={dict.emailLabel}
              type="email"
              name="email"
              icon={Mail}
              placeholder="admin@example.com"
              required
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={inviteMutation.isPending}
              >
                {dict.cancel}
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? dict.sending : dict.send}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
