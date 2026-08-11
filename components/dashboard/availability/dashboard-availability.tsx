"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Clock, CalendarX2, Settings2, Loader2, Pencil } from "lucide-react";
import { toast } from "react-toastify";

import { Modal } from "@/components/ui/modal";

import { onboardingApi } from "@/lib/api/onboarding-client";
import type {
  AvailabilitySettingsResponse,
  WeeklyWindowResponse,
  AvailabilityExceptionResponse,
  DayOfWeek,
  AvailabilityExceptionType,
} from "@/lib/api/types";
import { Locale } from "@/lib/i18n";

import { Input } from "@/components/ui/input";
import { ComboboxInput } from "@/components/ui/combobox-input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface DashboardAvailabilityProps {
  dict: any;
  common: any;
  lang: Locale;
  initialSettings: AvailabilitySettingsResponse;
  initialWindows: WeeklyWindowResponse[];
  initialExceptions: AvailabilityExceptionResponse[];
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export function DashboardAvailability({
  dict,
  common,
  lang,
  initialSettings,
  initialWindows,
  initialExceptions,
}: DashboardAvailabilityProps) {
  const { data: session } = useSession();
  const token = session?.accessToken as string;

  // State
  const [settings, setSettings] = useState(initialSettings);
  const [lastSavedSettings, setLastSavedSettings] = useState(initialSettings);
  const [windows, setWindows] = useState(initialWindows);
  const [exceptions, setExceptions] = useState(initialExceptions);

  const timezones = ["UTC", ...Intl.supportedValuesOf("timeZone")];

  // Forms State
  const [newWindowDay, setNewWindowDay] = useState<DayOfWeek>("MONDAY");
  const [newWindowStart, setNewWindowStart] = useState("09:00");
  const [newWindowEnd, setNewWindowEnd] = useState("17:00");

  const [newExceptionDate, setNewExceptionDate] = useState("");
  const [newExceptionType, setNewExceptionType] = useState<AvailabilityExceptionType>("CLOSED");
  const [newExceptionStart, setNewExceptionStart] = useState("09:00");
  const [newExceptionEnd, setNewExceptionEnd] = useState("17:00");
  const [newExceptionReason, setNewExceptionReason] = useState("");

  const [editingWindow, setEditingWindow] = useState<WeeklyWindowResponse | null>(null);
  const [editWindowDay, setEditWindowDay] = useState<DayOfWeek>("MONDAY");
  const [editWindowStart, setEditWindowStart] = useState("09:00");
  const [editWindowEnd, setEditWindowEnd] = useState("17:00");

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: typeof settings) => {
      return onboardingApi.updateAvailabilitySettings(token, data, lang);
    },
    onSuccess: (data) => {
      setSettings(data);
      setLastSavedSettings(data);
      toast.success(dict.toasts.settingsSaved);
    },
    onError: (err: any) => toast.error(err.message || common.errors.validationError),
  });

  function handleSettingsBlur() {
    if (
      settings.timezone !== lastSavedSettings.timezone ||
      settings.min_notice_hours !== lastSavedSettings.min_notice_hours ||
      settings.max_advance_days !== lastSavedSettings.max_advance_days ||
      settings.buffer_minutes !== lastSavedSettings.buffer_minutes
    ) {
      updateSettingsMutation.mutate(settings);
    }
  }

  const addWindowMutation = useMutation({
    mutationFn: async () => {
      return onboardingApi.createWeeklyWindow(
        token,
        {
          day_of_week: newWindowDay,
          start_time: newWindowStart,
          end_time: newWindowEnd,
        },
        lang
      );
    },
    onSuccess: (data) => {
      setWindows((prev) => [...prev, data]);
      toast.success(dict.toasts.windowAdded);
    },
    onError: (err: any) => toast.error(err.message || common.errors.validationError),
  });

  const deleteWindowMutation = useMutation({
    mutationFn: async (id: string) => {
      return onboardingApi.deleteWeeklyWindow(token, id, lang);
    },
    onSuccess: (_, id) => {
      setWindows((prev) => prev.filter((w) => w.id !== id));
      toast.success(dict.toasts.windowRemoved);
    },
    onError: (err: any) => toast.error(err.message || common.errors.validationError),
  });

  const editWindowMutation = useMutation({
    mutationFn: async () => {
      if (!editingWindow) throw new Error("No window selected");
      await onboardingApi.deleteWeeklyWindow(token, editingWindow.id, lang);
      return onboardingApi.createWeeklyWindow(
        token,
        {
          day_of_week: editWindowDay,
          start_time: editWindowStart,
          end_time: editWindowEnd,
        },
        lang
      );
    },
    onSuccess: (data) => {
      setWindows((prev) => prev.map((w) => (w.id === editingWindow?.id ? data : w)));
      setEditingWindow(null);
      toast.success("Updated successfully");
    },
    onError: (err: any) => toast.error(err.message || common.errors.validationError),
  });

  const addExceptionMutation = useMutation({
    mutationFn: async () => {
      return onboardingApi.createException(
        token,
        {
          date: newExceptionDate,
          exception_type: newExceptionType,
          start_time: newExceptionType === "CUSTOM_HOURS" ? newExceptionStart : undefined,
          end_time: newExceptionType === "CUSTOM_HOURS" ? newExceptionEnd : undefined,
          reason: newExceptionReason || undefined,
        },
        lang
      );
    },
    onSuccess: (data) => {
      setExceptions((prev) => [...prev, data]);
      setNewExceptionDate("");
      setNewExceptionReason("");
      toast.success(dict.toasts.exceptionAdded);
    },
    onError: (err: any) => toast.error(err.message || common.errors.validationError),
  });

  const deleteExceptionMutation = useMutation({
    mutationFn: async (id: string) => {
      return onboardingApi.deleteException(token, id, lang);
    },
    onSuccess: (_, id) => {
      setExceptions((prev) => prev.filter((e) => e.id !== id));
      toast.success(dict.toasts.exceptionRemoved);
    },
    onError: (err: any) => toast.error(err.message || common.errors.validationError),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left Column: Settings & Exceptions */}
      <div className="space-y-6 lg:col-span-5 flex flex-col">
        {/* Booking Rules Card */}
        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4 bg-muted/20">
            <Settings2 className="size-5 text-brand" />
            <h2 className="text-lg font-semibold text-foreground">{dict.settingsTitle}</h2>
          </div>
          
          <div className="flex flex-col p-2">
            <div className="flex items-center justify-between p-3 border-b border-border/40">
              <label className="text-sm font-medium text-foreground pr-4">{dict.timezoneLabel}</label>
              <div className="w-1/2 min-w-[200px]">
                <ComboboxInput
                  label={dict.timezoneLabel}
                  showLabel={false}
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  onBlur={handleSettingsBlur}
                  options={timezones}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border-b border-border/40">
              <label className="text-sm font-medium text-foreground pr-4">{dict.minNoticeHoursLabel}</label>
              <div className="w-24">
                <Input
                  label={dict.minNoticeHoursLabel}
                  showLabel={false}
                  type="number"
                  min="0"
                  value={settings.min_notice_hours}
                  onChange={(e) => setSettings({ ...settings, min_notice_hours: Number(e.target.value) })}
                  onBlur={handleSettingsBlur}
                  className="text-center !py-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border-b border-border/40">
              <label className="text-sm font-medium text-foreground pr-4">{dict.maxAdvanceDaysLabel}</label>
              <div className="w-24">
                <Input
                  label={dict.maxAdvanceDaysLabel}
                  showLabel={false}
                  type="number"
                  min="1"
                  value={settings.max_advance_days}
                  onChange={(e) => setSettings({ ...settings, max_advance_days: Number(e.target.value) })}
                  onBlur={handleSettingsBlur}
                  className="text-center !py-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3">
              <label className="text-sm font-medium text-foreground pr-4">{dict.bufferMinutesLabel}</label>
              <div className="w-24">
                <Input
                  label={dict.bufferMinutesLabel}
                  showLabel={false}
                  type="number"
                  min="0"
                  value={settings.buffer_minutes}
                  onChange={(e) => setSettings({ ...settings, buffer_minutes: Number(e.target.value) })}
                  onBlur={handleSettingsBlur}
                  className="text-center !py-2"
                />
              </div>
            </div>

            {updateSettingsMutation.isPending && (
              <div className="px-3 pb-3">
                <p className="flex items-center justify-end gap-1.5 text-xs text-brand">
                  <Loader2 className="size-3 animate-spin" /> Saving...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Exceptions Card */}
        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm overflow-hidden flex-1">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4 bg-muted/20">
            <CalendarX2 className="size-5 text-brand" />
            <h2 className="text-lg font-semibold text-foreground">{dict.exceptionsTitle}</h2>
          </div>
          
          <div className="flex flex-col gap-5 p-5 flex-1">
            {exceptions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {exceptions.map((exc) => (
                  <div key={exc.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
                    <div>
                      <div className="font-medium text-sm text-foreground">{exc.date}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {exc.exception_type === "CLOSED" ? dict.exceptionTypes.CLOSED : `${dict.exceptionTypes.CUSTOM_HOURS} (${exc.start_time?.slice(0, 5)} - ${exc.end_time?.slice(0, 5)})`}
                        {exc.reason && ` • ${exc.reason}`}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteExceptionMutation.mutate(exc.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-white hover:text-red-500 hover:shadow-sm transition-all dark:hover:bg-zinc-800"
                      disabled={deleteExceptionMutation.isPending}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">No exceptions added yet.</p>
            )}

            <div className="flex flex-col gap-4 rounded-xl border border-border border-dashed bg-muted/20 p-4 mt-auto">
              <h3 className="text-sm font-semibold text-foreground">Add Exception</h3>
              <div className="grid gap-3">
                <Input
                  label={dict.dateLabel}
                  showLabel
                  type="date"
                  value={newExceptionDate}
                  onChange={(e) => setNewExceptionDate(e.target.value)}
                />
                <Select
                  label={dict.exceptionTypeLabel}
                  showLabel
                  options={[
                    { value: "CLOSED", label: dict.exceptionTypes.CLOSED },
                    { value: "CUSTOM_HOURS", label: dict.exceptionTypes.CUSTOM_HOURS },
                  ]}
                  value={newExceptionType}
                  onChange={(val) => setNewExceptionType(val as AvailabilityExceptionType)}
                />
              </div>

              {newExceptionType === "CUSTOM_HOURS" && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={dict.startTimeLabel}
                    showLabel
                    type="time"
                    value={newExceptionStart}
                    onChange={(e) => setNewExceptionStart(e.target.value)}
                  />
                  <Input
                    label={dict.endTimeLabel}
                    showLabel
                    type="time"
                    value={newExceptionEnd}
                    onChange={(e) => setNewExceptionEnd(e.target.value)}
                  />
                </div>
              )}

              <Input
                label={dict.reasonLabel}
                showLabel
                placeholder="e.g. Holiday"
                value={newExceptionReason}
                onChange={(e) => setNewExceptionReason(e.target.value)}
              />
              <Button
                onClick={() => addExceptionMutation.mutate()}
                disabled={addExceptionMutation.isPending || !newExceptionDate}
                className="w-full"
              >
                <Plus className="mr-2 size-4" />
                {dict.addException}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Weekly Schedule */}
      <div className="lg:col-span-7">
        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm h-full overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4 bg-muted/20">
            <Clock className="size-5 text-brand" />
            <h2 className="text-lg font-semibold text-foreground">{dict.weeklyWindowsTitle}</h2>
          </div>

          <div className="flex flex-col p-5 h-full">
            <div className="flex flex-col gap-1">
              {DAYS_OF_WEEK.map((day) => {
                const dayWindows = windows.filter((w) => w.day_of_week === day);
                const hasWindows = dayWindows.length > 0;
                return (
                  <div key={day} className="flex flex-col gap-3 border-b border-border/40 py-4 last:border-0 sm:flex-row sm:items-center">
                    <div className="flex w-32 items-center gap-2 text-sm font-medium text-foreground">
                      <div className={`size-1.5 rounded-full ${hasWindows ? "bg-brand shadow-[0_0_8px_rgba(var(--brand),0.6)]" : "bg-border"}`} />
                      <span className={hasWindows ? "" : "text-muted-foreground"}>{dict.days[day]}</span>
                    </div>
                    <div className="flex flex-1 flex-wrap gap-2">
                      {hasWindows ? (
                        dayWindows.map((w) => (
                          <div
                            key={w.id}
                            className="group flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 pl-3 pr-1 py-1 text-sm font-medium text-brand transition-colors hover:border-brand/30 hover:bg-brand/10"
                          >
                            <Clock className="size-3.5 opacity-70" />
                            <span className="mr-1">
                              {w.start_time.slice(0, 5)} - {w.end_time.slice(0, 5)}
                            </span>
                            <div className="flex items-center gap-0.5 ml-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingWindow(w);
                                  setEditWindowDay(w.day_of_week);
                                  setEditWindowStart(w.start_time.slice(0, 5));
                                  setEditWindowEnd(w.end_time.slice(0, 5));
                                }}
                                className="flex size-6 items-center justify-center rounded-full text-brand/60 transition-colors hover:bg-brand/10 hover:text-brand focus:outline-none"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteWindowMutation.mutate(w.id)}
                                className="flex size-6 items-center justify-center rounded-full text-brand/60 transition-colors hover:bg-red-500/10 hover:text-red-600 focus:outline-none"
                                disabled={deleteWindowMutation.isPending}
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground/60">{dict.exceptionTypes.CLOSED}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto pt-6">
              <div className="flex flex-col gap-4 rounded-xl border border-border border-dashed bg-muted/20 p-5">
                <h3 className="text-sm font-semibold text-foreground">Add Working Hours</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Select
                    label="Day"
                    showLabel
                    options={DAYS_OF_WEEK.map(d => ({ value: d, label: dict.days[d] }))}
                    value={newWindowDay}
                    onChange={setNewWindowDay}
                  />
                  <Input
                    label={dict.startTimeLabel}
                    showLabel
                    type="time"
                    value={newWindowStart}
                    onChange={(e) => setNewWindowStart(e.target.value)}
                  />
                  <Input
                    label={dict.endTimeLabel}
                    showLabel
                    type="time"
                    value={newWindowEnd}
                    onChange={(e) => setNewWindowEnd(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => addWindowMutation.mutate()}
                  disabled={addWindowMutation.isPending}
                  className="w-full mt-2"
                >
                  <Plus className="mr-2 size-4" />
                  {dict.addWindow}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={!!editingWindow} onClose={() => setEditingWindow(null)} labelledBy="edit-window-title">
        <div className="space-y-5">
          <h2 id="edit-window-title" className="text-xl font-semibold text-foreground">{dict.editWindow}</h2>
          <div className="grid gap-4">
            <Select
              label={dict.dayLabel}
              showLabel
              options={DAYS_OF_WEEK.map(d => ({ value: d, label: dict.days[d] }))}
              value={editWindowDay}
              onChange={(val) => setEditWindowDay(val as DayOfWeek)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={dict.startTimeLabel}
                showLabel
                type="time"
                value={editWindowStart}
                onChange={(e) => setEditWindowStart(e.target.value)}
              />
              <Input
                label={dict.endTimeLabel}
                showLabel
                type="time"
                value={editWindowEnd}
                onChange={(e) => setEditWindowEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setEditingWindow(null)}>{dict.cancel}</Button>
            <Button onClick={() => editWindowMutation.mutate()} disabled={editWindowMutation.isPending}>
              {editWindowMutation.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              {dict.update}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
