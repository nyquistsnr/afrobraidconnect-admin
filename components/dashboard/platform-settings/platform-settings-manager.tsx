"use client";

import { useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { platformSettingsApi } from "@/lib/api/platform-settings-client";
import type {
  CountryVatSettings,
  PlatformSettings,
  SettingValueType,
} from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";

type PlatformSettingsDict = Dictionary["dashboard"]["platformSettings"];
type SettingTypeKey =
  | "platform_fee_type"
  | "vat_type"
  | "vat_platform_fee_type"
  | "deposit_type";
type SettingValueKey =
  | "platform_fee_value"
  | "vat_value"
  | "vat_platform_fee_value"
  | "deposit_value";
type SettingsErrors = Partial<Record<SettingValueKey, string>>;

const fallbackSettings: PlatformSettings = {
  id: "",
  platform_fee_type: "PERCENTAGE",
  platform_fee_value: "10.00",
  vat_type: "PERCENTAGE",
  vat_value: "20.00",
  vat_platform_fee_type: "PERCENTAGE",
  vat_platform_fee_value: "20.00",
  deposit_type: "PERCENTAGE",
  deposit_value: "10.00",
};

export function PlatformSettingsManager({
  accessToken,
  lang,
  dict,
  initialSettings,
  initialCountryVat,
  initialLoadError,
}: {
  accessToken: string;
  lang: Locale;
  dict: PlatformSettingsDict;
  initialSettings: PlatformSettings | null;
  initialCountryVat: CountryVatSettings[];
  initialLoadError: boolean;
}) {
  const [settings, setSettings] = useState(initialSettings ?? fallbackSettings);
  const [countryVat, setCountryVat] = useState(initialCountryVat);
  const [settingsErrors, setSettingsErrors] = useState<SettingsErrors>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [vatModal, setVatModal] = useState<CountryVatSettings | "new" | null>(
    null
  );
  const [deletingCountry, setDeletingCountry] = useState<string | null>(null);

  const typeOptions = useMemo(
    () => [
      { value: "PERCENTAGE" as const, label: dict.typeLabels.PERCENTAGE },
      { value: "FIXED" as const, label: dict.typeLabels.FIXED },
    ],
    [dict.typeLabels]
  );

  const fieldGroups = useMemo(
    () => [
      {
        typeKey: "platform_fee_type" as const,
        valueKey: "platform_fee_value" as const,
        title: dict.fields.platformFee.title,
        description: dict.fields.platformFee.description,
      },
      {
        typeKey: "vat_type" as const,
        valueKey: "vat_value" as const,
        title: dict.fields.vat.title,
        description: dict.fields.vat.description,
      },
      {
        typeKey: "vat_platform_fee_type" as const,
        valueKey: "vat_platform_fee_value" as const,
        title: dict.fields.vatPlatformFee.title,
        description: dict.fields.vatPlatformFee.description,
      },
      {
        typeKey: "deposit_type" as const,
        valueKey: "deposit_value" as const,
        title: dict.fields.deposit.title,
        description: dict.fields.deposit.description,
      },
    ],
    [dict.fields]
  );

  function setType(key: SettingTypeKey, value: SettingValueType) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function setValue(key: SettingValueKey, value: string) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSettingsErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validateSettingValue(
    type: SettingValueType,
    value: string
  ): string | null {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return dict.errors.invalidNumber;
    if (type === "PERCENTAGE" && parsed > 100)
      return dict.errors.percentageTooHigh;
    return null;
  }

  function validateSettings() {
    const nextErrors: SettingsErrors = {};
    for (const field of fieldGroups) {
      const error = validateSettingValue(
        settings[field.typeKey],
        settings[field.valueKey]
      );
      if (error) nextErrors[field.valueKey] = error;
    }
    setSettingsErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateSettings()) {
      toast.error(dict.errors.validation);
      return;
    }

    setSavingSettings(true);
    try {
      const updated = await platformSettingsApi.update(accessToken, lang, {
        platform_fee_type: settings.platform_fee_type,
        platform_fee_value: settings.platform_fee_value,
        vat_type: settings.vat_type,
        vat_value: settings.vat_value,
        vat_platform_fee_type: settings.vat_platform_fee_type,
        vat_platform_fee_value: settings.vat_platform_fee_value,
        deposit_type: settings.deposit_type,
        deposit_value: settings.deposit_value,
      });
      setSettings(updated);
      toast.success(dict.saved);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : dict.saveError);
    } finally {
      setSavingSettings(false);
    }
  }

  async function refresh() {
    setRefreshing(true);
    try {
      const [nextSettings, nextCountryVat] = await Promise.all([
        platformSettingsApi.get(accessToken, lang),
        platformSettingsApi.listCountryVat(accessToken, lang),
      ]);
      setSettings(nextSettings);
      setCountryVat(nextCountryVat);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : dict.loadError);
    } finally {
      setRefreshing(false);
    }
  }

  async function deleteOverride() {
    if (!deletingCountry) return;
    try {
      await platformSettingsApi.deleteCountryVat(
        accessToken,
        lang,
        deletingCountry
      );
      setCountryVat((current) =>
        current.filter((item) => item.country !== deletingCountry)
      );
      setDeletingCountry(null);
      toast.success(dict.deleted);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : dict.saveError);
    }
  }

  const columns: DataTableColumn<CountryVatSettings>[] = [
    {
      key: "country",
      header: dict.countryVat.table.country,
      render: (row) => <span className="font-semibold">{row.country}</span>,
    },
    {
      key: "serviceVat",
      header: dict.countryVat.table.serviceVat,
      render: (row) => (
        <ValueWithType
          type={row.vat_type}
          value={row.vat_value}
          dict={dict}
        />
      ),
    },
    {
      key: "platformVat",
      header: dict.countryVat.table.platformFeeVat,
      render: (row) => (
        <ValueWithType
          type={row.vat_platform_fee_type}
          value={row.vat_platform_fee_value}
          dict={dict}
        />
      ),
    },
    {
      key: "actions",
      header: dict.countryVat.table.actions,
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => setVatModal(row)}
            title={dict.edit}
            aria-label={`${dict.edit} ${row.country}`}
            className="p-2 text-muted-foreground transition-colors hover:bg-border/40 hover:text-foreground"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingCountry(row.country)}
            title={dict.delete}
            aria-label={`${dict.delete} ${row.country}`}
            className="p-2 text-red-600 transition-colors hover:bg-red-500/10"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-brand">{dict.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {dict.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{dict.subtitle}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={refresh}
          disabled={refreshing}
        >
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
          {dict.refresh}
        </Button>
      </div>

      {initialLoadError && (
        <div className="border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          {dict.loadError}
        </div>
      )}

      <form
        onSubmit={saveSettings}
        className="border border-border bg-surface shadow-sm"
      >
        <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="mt-0.5 bg-brand/10 p-2 text-brand">
            <Settings2 className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              {dict.pricingTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dict.pricingSubtitle}
            </p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {fieldGroups.map((field) => (
            <div
              key={field.valueKey}
              className="grid gap-4 px-4 py-5 sm:px-5 lg:grid-cols-[minmax(0,1fr)_180px_180px]"
            >
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {field.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {field.description}
                </p>
              </div>
              <Select<SettingValueType>
                label={`${field.title} ${dict.typeLabel}`}
                showLabel
                value={settings[field.typeKey]}
                onChange={(value) => setType(field.typeKey, value)}
                options={typeOptions}
              />
              <Input
                label={`${field.title} ${dict.valueLabel}`}
                showLabel
                type="number"
                min="0"
                step="0.01"
                value={settings[field.valueKey]}
                onChange={(event) =>
                  setValue(field.valueKey, event.target.value)
                }
                error={settingsErrors[field.valueKey]}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-border px-4 py-4 sm:px-5">
          <Button className="w-full sm:w-auto" disabled={savingSettings}>
            <Save className="size-4" />
            {savingSettings ? dict.saving : dict.save}
          </Button>
        </div>
      </form>

      <section className="border border-border bg-surface shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:px-5">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {dict.countryVat.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dict.countryVat.subtitle}
            </p>
          </div>
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => setVatModal("new")}
          >
            <Plus className="size-4" />
            {dict.countryVat.add}
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={countryVat}
          getRowKey={(row) => row.country}
          renderMobileCard={(row) => (
            <div className="border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {row.country}
                  </p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {dict.countryVat.table.serviceVat}
                      </dt>
                      <dd className="mt-1">
                        <ValueWithType
                          type={row.vat_type}
                          value={row.vat_value}
                          dict={dict}
                        />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {dict.countryVat.table.platformFeeVat}
                      </dt>
                      <dd className="mt-1">
                        <ValueWithType
                          type={row.vat_platform_fee_type}
                          value={row.vat_platform_fee_value}
                          dict={dict}
                        />
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setVatModal(row)}
                    title={dict.edit}
                    aria-label={`${dict.edit} ${row.country}`}
                    className="p-2 text-muted-foreground hover:bg-border/40 hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingCountry(row.country)}
                    title={dict.delete}
                    aria-label={`${dict.delete} ${row.country}`}
                    className="p-2 text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
          emptyState={
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {dict.countryVat.emptyTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {dict.countryVat.emptyDescription}
              </p>
            </div>
          }
        />
      </section>

      {vatModal && (
        <CountryVatModal
          key={vatModal === "new" ? "new" : vatModal.country}
          item={vatModal}
          accessToken={accessToken}
          lang={lang}
          dict={dict}
          typeOptions={typeOptions}
          onClose={() => setVatModal(null)}
          onSaved={(saved) => {
            setCountryVat((current) => {
              const withoutCurrent = current.filter(
                (item) => item.country !== saved.country
              );
              return [...withoutCurrent, saved].sort((a, b) =>
                a.country.localeCompare(b.country)
              );
            });
            setVatModal(null);
          }}
        />
      )}

      <Modal
        open={!!deletingCountry}
        onClose={() => setDeletingCountry(null)}
        labelledBy="delete-country-vat"
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="delete-country-vat" className="text-lg font-bold">
                {dict.countryVat.deleteTitle}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {dict.countryVat.deleteDescription}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeletingCountry(null)}
              aria-label={dict.cancel}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className="w-auto"
              onClick={() => setDeletingCountry(null)}
            >
              {dict.cancel}
            </Button>
            <Button
              type="button"
              className="w-auto bg-red-600 text-white hover:bg-red-700"
              onClick={deleteOverride}
            >
              <Trash2 className="size-4" />
              {dict.delete}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ValueWithType({
  type,
  value,
  dict,
}: {
  type: SettingValueType;
  value: string;
  dict: PlatformSettingsDict;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-foreground">
        {type === "PERCENTAGE" ? `${value}%` : value}
      </span>
      <Badge tone={type === "PERCENTAGE" ? "brand" : "neutral"} dot={false}>
        {dict.typeLabels[type]}
      </Badge>
    </div>
  );
}

function CountryVatModal({
  item,
  accessToken,
  lang,
  dict,
  typeOptions,
  onClose,
  onSaved,
}: {
  item: CountryVatSettings | "new";
  accessToken: string;
  lang: Locale;
  dict: PlatformSettingsDict;
  typeOptions: { value: SettingValueType; label: string }[];
  onClose: () => void;
  onSaved: (settings: CountryVatSettings) => void;
}) {
  const existing = item && item !== "new" ? item : null;
  const [country, setCountry] = useState(existing?.country ?? "");
  const [vatType, setVatType] = useState<SettingValueType>(
    existing?.vat_type ?? "PERCENTAGE"
  );
  const [vatValue, setVatValue] = useState(existing?.vat_value ?? "");
  const [platformType, setPlatformType] = useState<SettingValueType>(
    existing?.vat_platform_fee_type ?? "PERCENTAGE"
  );
  const [platformValue, setPlatformValue] = useState(
    existing?.vat_platform_fee_value ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<"country" | "vatValue" | "platformValue", string>>
  >({});

  function validate() {
    const nextErrors: Partial<
      Record<"country" | "vatValue" | "platformValue", string>
    > = {};
    const normalizedCountry = country.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalizedCountry)) {
      nextErrors.country = dict.errors.invalidCountry;
    }

    const vatNumber = Number(vatValue);
    if (!Number.isFinite(vatNumber) || vatNumber < 0) {
      nextErrors.vatValue = dict.errors.invalidNumber;
    } else if (vatType === "PERCENTAGE" && vatNumber > 100) {
      nextErrors.vatValue = dict.errors.percentageTooHigh;
    }

    const platformNumber = Number(platformValue);
    if (!Number.isFinite(platformNumber) || platformNumber < 0) {
      nextErrors.platformValue = dict.errors.invalidNumber;
    } else if (platformType === "PERCENTAGE" && platformNumber > 100) {
      nextErrors.platformValue = dict.errors.percentageTooHigh;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      toast.error(dict.errors.validation);
      return;
    }

    setSaving(true);
    try {
      const saved = await platformSettingsApi.upsertCountryVat(
        accessToken,
        lang,
        country.trim().toUpperCase(),
        {
          vat_type: vatType,
          vat_value: vatValue,
          vat_platform_fee_type: platformType,
          vat_platform_fee_value: platformValue,
        }
      );
      toast.success(dict.saved);
      onSaved(saved);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : dict.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} labelledBy="country-vat-modal" size="lg">
      <form onSubmit={save} className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="country-vat-modal" className="text-lg font-bold">
              {existing ? dict.countryVat.editTitle : dict.countryVat.addTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dict.countryVat.modalDescription}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.cancel}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <Input
          label={dict.countryVat.countryLabel}
          showLabel
          value={country}
          onChange={(event) => {
            setCountry(event.target.value.toUpperCase());
            setErrors((current) => ({ ...current, country: undefined }));
          }}
          maxLength={2}
          placeholder="DE"
          disabled={!!existing}
          error={errors.country}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select<SettingValueType>
            label={dict.countryVat.serviceVatTypeLabel}
            showLabel
            value={vatType}
            onChange={setVatType}
            options={typeOptions}
          />
          <Input
            label={dict.countryVat.serviceVatValueLabel}
            showLabel
            type="number"
            min="0"
            step="0.01"
            value={vatValue}
            onChange={(event) => {
              setVatValue(event.target.value);
              setErrors((current) => ({ ...current, vatValue: undefined }));
            }}
            error={errors.vatValue}
          />
          <Select<SettingValueType>
            label={dict.countryVat.platformVatTypeLabel}
            showLabel
            value={platformType}
            onChange={setPlatformType}
            options={typeOptions}
          />
          <Input
            label={dict.countryVat.platformVatValueLabel}
            showLabel
            type="number"
            min="0"
            step="0.01"
            value={platformValue}
            onChange={(event) => {
              setPlatformValue(event.target.value);
              setErrors((current) => ({
                ...current,
                platformValue: undefined,
              }));
            }}
            error={errors.platformValue}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            className="w-auto"
            onClick={onClose}
          >
            {dict.cancel}
          </Button>
          <Button className="w-auto" disabled={saving}>
            <Save className="size-4" />
            {saving ? dict.saving : dict.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
