"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ImageOff, Search, Pencil, Trash2, CheckCircle2, Scissors, Compass } from "lucide-react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Locale } from "@/lib/i18n";
import type {
  AddOnPublicResponse,
  BraiderStyleAddonInput,
  BraiderStyleResponse,
  BraiderStyleVariationInput,
  StylePublicResponse,
} from "@/lib/api/types";
import { onboardingApi } from "@/lib/api/onboarding-client";
import { catalogApi } from "@/lib/api/catalog-client";
import { ApiError } from "@/lib/api/auth-client";
import { getAuthErrorMessage } from "@/lib/api/error-messages";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const SEARCH_DEBOUNCE_MS = 350;

function addedStyleName(
  service: BraiderStyleResponse,
  lang: Locale
): string {
  if (lang === "de" && service.style_name_de) return service.style_name_de;
  if (lang === "fr" && service.style_name_fr) return service.style_name_fr;
  return service.style_name_en;
}

interface VariationSelection {
  checked: boolean;
  price: string;
}

interface AddonSelection {
  checked: boolean;
  price: string;
  required: boolean;
}

function isValidPrice(value: string): boolean {
  const n = Number(value);
  return value.trim() !== "" && Number.isFinite(n) && n > 0;
}

export function ServiceTypeForm({
  dict,
  common,
  lang,
  initialServices,
  isDashboard,
}: {
  dict: Dictionary["onboarding"]["serviceType"];
  common: Dictionary["common"];
  lang: Locale;
  initialServices: BraiderStyleResponse[];
  isDashboard?: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const modalTitleId = useId();

  const [editingBraiderStyleId, setEditingBraiderStyleId] = useState<string | null>(null);
  const [isFetchingEdit, setIsFetchingEdit] = useState(false);

  const [services, setServices] = useState(initialServices);
  const [categoryId, setCategoryId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedStyle, setSelectedStyle] = useState<StylePublicResponse | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<BraiderStyleResponse | null>(null);
  const [basePrice, setBasePrice] = useState("");
  const [duration, setDuration] = useState("");
  const [variationSelections, setVariationSelections] = useState<Record<string, VariationSelection>>({});
  const [addonSelections, setAddonSelections] = useState<Record<string, AddonSelection>>({});

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const categoriesQuery = useQuery({
    queryKey: ["style-categories", lang],
    queryFn: () => catalogApi.getStyleCategories(lang),
  });

  const addonsQuery = useQuery({
    queryKey: ["addons", lang],
    queryFn: () => catalogApi.getAddons(lang),
  });

  const stylesQuery = useInfiniteQuery({
    queryKey: ["styles", categoryId, debouncedSearch, lang],
    queryFn: ({ pageParam }) =>
      catalogApi.getStyles(
        {
          categoryId: categoryId || undefined,
          search: debouncedSearch || undefined,
          page: pageParam,
        },
        lang
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_next ? lastPage.pagination.page + 1 : undefined,
  });

  const styles = stylesQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const addons: AddOnPublicResponse[] = addonsQuery.data ?? [];

  const addedStyleIds = useMemo(
    () => new Set(services.map((service) => service.style_id)),
    [services]
  );

  const addMutation = useMutation({
    mutationFn: () => {
      const variations: BraiderStyleVariationInput[] = Object.entries(
        variationSelections
      )
        .filter(([, selection]) => selection.checked)
        .map(([styleVariationId, selection]) => ({
          style_variation_id: styleVariationId,
          price: Number(selection.price),
        }));

      const selectedAddons: BraiderStyleAddonInput[] = Object.entries(
        addonSelections
      )
        .filter(([, selection]) => selection.checked)
        .map(([addonId, selection]) => ({
          addon_id: addonId,
          price: Number(selection.price),
          is_required: selection.required,
        }));

      return onboardingApi.addService(
        session!.accessToken,
        {
          style_id: selectedStyle!.id,
          base_price: Number(basePrice),
          duration_minutes: duration ? Number(duration) : undefined,
          variations,
          addons: selectedAddons,
        },
        lang
      );
    },
    onSuccess: (data) => {
      setServices((current) => [...current, data]);
      toast.success(dict.toasts.added);
      setSelectedStyle(null);
    },
    onError: (error) => {
      const code = error instanceof ApiError ? error.code : undefined;
      toast.error(getAuthErrorMessage(code, common.errors));
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingBraiderStyleId) throw new Error("No style ID to update");
      const variations: BraiderStyleVariationInput[] = Object.entries(
        variationSelections
      )
        .filter(([, selection]) => selection.checked)
        .map(([styleVariationId, selection]) => ({
          style_variation_id: styleVariationId,
          price: Number(selection.price),
        }));

      const selectedAddons: BraiderStyleAddonInput[] = Object.entries(
        addonSelections
      )
        .filter(([, selection]) => selection.checked)
        .map(([addonId, selection]) => ({
          addon_id: addonId,
          price: Number(selection.price),
          is_required: selection.required,
        }));

      return onboardingApi.updateService(
        session!.accessToken,
        editingBraiderStyleId,
        {
          base_price: Number(basePrice),
          duration_minutes: duration ? Number(duration) : undefined,
          is_active: true,
          variations,
          addons: selectedAddons,
        },
        lang
      );
    },
    onSuccess: (data) => {
      setServices((current) =>
        current.map((s) => (s.id === data.id ? data : s))
      );
      toast.success(dict.toasts.saved || "Service updated");
      setSelectedStyle(null);
      setEditingBraiderStyleId(null);
    },
    onError: (error) => {
      const code = error instanceof ApiError ? error.code : undefined;
      toast.error(getAuthErrorMessage(code, common.errors));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (braiderStyleId: string) =>
      onboardingApi.deleteService(session!.accessToken, braiderStyleId, lang),
    onSuccess: (_, braiderStyleId) => {
      setServices((current) => current.filter((s) => s.id !== braiderStyleId));
      toast.success(dict.toasts.removed || "Service removed");
      setServiceToDelete(null);
    },
    onError: (error) => {
      const code = error instanceof ApiError ? error.code : undefined;
      toast.error(getAuthErrorMessage(code, common.errors));
    },
  });

  function openStyle(style: StylePublicResponse) {
    setSelectedStyle(style);
    setEditingBraiderStyleId(null);
    setBasePrice("");
    setDuration("");
    setVariationSelections(
      Object.fromEntries(
        style.variations.map((variation) => [
          variation.id,
          { checked: false, price: "" },
        ])
      )
    );
    setAddonSelections(
      Object.fromEntries(
        addons.map((addon) => [
          addon.id,
          {
            checked: false,
            price: addon.suggested_price?.toString() ?? "",
            required: false,
          },
        ])
      )
    );
  }

  async function handleEditStyle(braiderStyle: BraiderStyleResponse) {
    try {
      setIsFetchingEdit(true);
      const stylePublic = await queryClient.fetchQuery({
        queryKey: ["style", braiderStyle.style_id, lang],
        queryFn: () => catalogApi.getStyle(braiderStyle.style_id, lang),
      });

      setSelectedStyle(stylePublic);
      setEditingBraiderStyleId(braiderStyle.id);
      setBasePrice(braiderStyle.base_price.toString());
      setDuration(braiderStyle.duration_minutes?.toString() ?? "");

      const vSelections: Record<string, VariationSelection> = {};
      for (const v of stylePublic.variations) {
        const existing = braiderStyle.variations.find(
          (bv) => bv.style_variation_id === v.id
        );
        vSelections[v.id] = {
          checked: !!existing,
          price: existing ? existing.price.toString() : "",
        };
      }
      setVariationSelections(vSelections);

      const aSelections: Record<string, AddonSelection> = {};
      for (const a of addons) {
        const existing = braiderStyle.addons.find(
          (ba) => ba.addon_id === a.id
        );
        aSelections[a.id] = {
          checked: !!existing,
          price: existing
            ? existing.price.toString()
            : (a.suggested_price?.toString() ?? ""),
          required: existing ? existing.is_required : false,
        };
      }
      setAddonSelections(aSelections);
    } catch (error) {
      console.error(error);
      toast.error("Could not fetch style details");
    } finally {
      setIsFetchingEdit(false);
    }
  }

  function handleContinue() {
    router.refresh();
    router.push(`/${lang}/onboarding`);
  }

  const hasInvalidVariationPrice = Object.values(variationSelections).some(
    (selection) => selection.checked && !isValidPrice(selection.price)
  );
  const hasInvalidAddonPrice = Object.values(addonSelections).some(
    (selection) => selection.checked && !isValidPrice(selection.price)
  );
  const canSubmit =
    isValidPrice(basePrice) && !hasInvalidVariationPrice && !hasInvalidAddonPrice;

  const categoryOptions = [
    { value: "", label: dict.allCategories },
    ...(categoriesQuery.data ?? []).map((category) => ({ value: category.id, label: category.name }))
  ];

  return (
    <div className="w-full relative">
      {(isFetchingEdit || deleteMutation.isPending) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="max-w-xl mx-auto text-center lg:text-left lg:mx-0">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          {isDashboard ? dict.dashboardTitle || dict.title : dict.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {isDashboard ? dict.dashboardSubtitle || dict.subtitle : dict.subtitle}
        </p>
      </div>

      <div className="mt-10 flex flex-col lg:flex-row gap-12 items-start">
        {/* Your Menu Section */}
        <div className="w-full lg:w-2/5 shrink-0 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Scissors className="size-5 text-brand" />
            <h2 className="text-lg font-semibold text-foreground">{dict.menuTitle}</h2>
          </div>
          
          {services.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center flex flex-col items-center justify-center">
              <Scissors className="size-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-foreground">{dict.emptyMenu}</p>
              <p className="text-xs text-muted-foreground mt-1">Select from the catalog to start building your menu.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {services.map((service) => (
                <div key={service.id} className="group flex flex-col p-4 rounded-xl border border-border bg-surface shadow-sm transition-all hover:shadow-md hover:border-brand/30">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{addedStyleName(service, lang)}</h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{Number(service.base_price).toFixed(2)} €</span>
                        {service.duration_minutes && (
                          <>
                            <span>•</span>
                            <span>{service.duration_minutes} min</span>
                          </>
                        )}
                      </div>
                      
                      {/* Summary Badges */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {service.variations.length > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand/10 text-[10px] font-medium text-brand">
                            {service.variations.length} {service.variations.length === 1 ? 'Variation' : 'Variations'}
                          </span>
                        )}
                        {service.addons.length > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/10 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                            {service.addons.length} {service.addons.length === 1 ? 'Add-on' : 'Add-ons'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => handleEditStyle(service)}
                        className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-brand/10 hover:text-brand"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => setServiceToDelete(service)}
                        className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discover Catalog Section */}
        <div className="w-full lg:w-3/5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Compass className="size-5 text-brand" />
            <h2 className="text-lg font-semibold text-foreground">{dict.discoverCatalog}</h2>
          </div>
          
          <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col h-full min-h-[600px] max-h-[800px]">
            <div className="p-4 border-b border-border bg-muted/30 grid gap-4 sm:grid-cols-2 shrink-0 z-10">
              <Select
                label={dict.categoryLabel}
                showLabel={false}
                value={categoryId}
                onChange={setCategoryId}
                placeholder={dict.categoryPlaceholder}
                options={categoryOptions}
              />
              <Input
                label={dict.searchLabel}
                showLabel={false}
                icon={Search}
                placeholder={dict.searchPlaceholder}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto bg-card">
              <div className="p-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {styles.map((style) => {
                  const added = addedStyleIds.has(style.id);
                  const thumbnail = style.images[0]?.url;
                  return (
                    <div
                      key={style.id}
                      className="flex flex-col rounded-xl border border-border bg-surface overflow-hidden transition-colors hover:border-brand/50"
                    >
                      <div className="relative aspect-square w-full shrink-0 bg-muted">
                        {thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbnail}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <ImageOff className="size-6 text-icon-muted" />
                          </div>
                        )}
                        {added && (
                          <div className="absolute top-2 right-2 bg-brand text-brand-foreground rounded-full p-1 shadow-sm">
                            <CheckCircle2 className="size-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-3 p-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                            {style.name}
                          </p>
                          {style.description && (
                            <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                              {style.description}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant={added ? "default" : "outline"}
                          size="sm"
                          disabled={added}
                          onClick={() => openStyle(style)}
                          className="w-full text-xs h-8"
                        >
                          {added ? dict.addedBadge : dict.selectButton}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!stylesQuery.isLoading && styles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-card">
                  <Search className="size-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-foreground">{dict.noResults}</p>
                  <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or category filter.</p>
                </div>
              )}

              {stylesQuery.hasNextPage && (
                <div className="p-4 flex justify-center border-t border-border/50">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={stylesQuery.isFetchingNextPage}
                    onClick={() => stylesQuery.fetchNextPage()}
                  >
                    {stylesQuery.isFetchingNextPage ? common.loading : dict.loadMore}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isDashboard && services.length > 0 && (
        <Button type="button" size="lg" className="mt-10 w-full text-base" onClick={handleContinue}>
          {dict.continue}
        </Button>
      )}

      {/* Edit/Add Modal */}
      <Modal
        open={!!selectedStyle}
        onClose={() => {
          setSelectedStyle(null);
          setEditingBraiderStyleId(null);
        }}
        labelledBy={modalTitleId}
        size="lg"
      >
        {selectedStyle && (
          <>
            <h2 id={modalTitleId} className="text-xl font-bold text-foreground tracking-tight">
              {editingBraiderStyleId ? dict.editService : selectedStyle.name}
            </h2>
            {selectedStyle.description && !editingBraiderStyleId && (
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedStyle.description}
              </p>
            )}

            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={dict.basePriceLabel}
                  showLabel
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder={dict.basePricePlaceholder}
                  value={basePrice}
                  onChange={(event) => setBasePrice(event.target.value)}
                  required
                />
                <Input
                  label={dict.durationLabel}
                  showLabel
                  type="number"
                  min="1"
                  step="1"
                  placeholder={dict.durationPlaceholder}
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                />
              </div>

              {selectedStyle.variations.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground border-b border-border pb-2">
                    {dict.variationsTitle}
                  </h3>
                  <div className="space-y-2">
                    {selectedStyle.variations.map((variation) => {
                      const selection = variationSelections[variation.id];
                      return (
                        <div key={variation.id} className="rounded-lg border border-border bg-muted/20 p-3">
                          <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              className="size-4 shrink-0 rounded border-input text-brand accent-brand focus:ring-brand"
                              checked={selection?.checked ?? false}
                              onChange={(event) =>
                                setVariationSelections((current) => ({
                                  ...current,
                                  [variation.id]: {
                                    checked: event.target.checked,
                                    price: current[variation.id]?.price ?? "",
                                  },
                                }))
                              }
                            />
                            {variation.name}
                          </label>

                          {selection?.checked && (
                            <div className="mt-3 pl-7">
                              <Input
                                label={dict.priceLabel}
                                showLabel={false}
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder={dict.priceLabel}
                                value={selection.price}
                                onChange={(event) =>
                                  setVariationSelections((current) => ({
                                    ...current,
                                    [variation.id]: {
                                      checked: true,
                                      price: event.target.value,
                                    },
                                  }))
                                }
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {addons.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground border-b border-border pb-2">
                    {dict.addonsTitle}
                  </h3>
                  <div className="space-y-2">
                    {addons.map((addon) => {
                      const selection = addonSelections[addon.id];
                      return (
                        <div key={addon.id} className="rounded-lg border border-border bg-muted/20 p-3">
                          <label className="flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              className="size-4 shrink-0 rounded border-input text-brand accent-brand focus:ring-brand"
                              checked={selection?.checked ?? false}
                              onChange={(event) =>
                                setAddonSelections((current) => ({
                                  ...current,
                                  [addon.id]: {
                                    checked: event.target.checked,
                                    price: current[addon.id]?.price ?? addon.suggested_price?.toString() ?? "",
                                    required: current[addon.id]?.required ?? false,
                                  },
                                }))
                              }
                            />
                            {addon.name}
                          </label>

                          {selection?.checked && (
                            <div className="mt-3 space-y-3 pl-7">
                              <Input
                                label={dict.priceLabel}
                                showLabel={false}
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder={dict.priceLabel}
                                value={selection.price}
                                onChange={(event) =>
                                  setAddonSelections((current) => ({
                                    ...current,
                                    [addon.id]: {
                                      checked: true,
                                      price: event.target.value,
                                      required: current[addon.id]?.required ?? false,
                                    },
                                  }))
                                }
                              />
                              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="size-3.5 rounded border-input text-brand accent-brand focus:ring-brand"
                                  checked={selection.required}
                                  onChange={(event) =>
                                    setAddonSelections((current) => ({
                                      ...current,
                                      [addon.id]: {
                                        checked: true,
                                        price: current[addon.id]?.price ?? "",
                                        required: event.target.checked,
                                      },
                                    }))
                                  }
                                />
                                {dict.requiredLabel}
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 -mx-4 -mb-4 mt-8 flex gap-3 border-t border-border bg-surface px-4 py-4 sm:-mx-6 sm:-mb-6 sm:px-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedStyle(null)}
              >
                {dict.cancel}
              </Button>
              <Button
                type="button"
                className="flex-1"
                disabled={!canSubmit || addMutation.isPending || updateMutation.isPending}
                onClick={() => {
                  if (editingBraiderStyleId) {
                    updateMutation.mutate();
                  } else {
                    addMutation.mutate();
                  }
                }}
              >
                {addMutation.isPending || updateMutation.isPending
                  ? common.loading
                  : editingBraiderStyleId
                  ? dict.saveChanges || "Save Changes"
                  : dict.addButton}
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!serviceToDelete}
        onClose={() => setServiceToDelete(null)}
        labelledBy={`${modalTitleId}-delete`}
        size="sm"
      >
        {serviceToDelete && (
          <div className="p-2">
            <h2 id={`${modalTitleId}-delete`} className="text-xl font-bold text-foreground tracking-tight">
              {dict.deleteService}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {dict.deleteConfirmMessage.replace('{styleName}', addedStyleName(serviceToDelete, lang))}
            </p>
            <div className="mt-8 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setServiceToDelete(null)}
                disabled={deleteMutation.isPending}
              >
                {dict.cancel || "Cancel"}
              </Button>
              <Button
                type="button"
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                onClick={() => deleteMutation.mutate(serviceToDelete.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? common.loading : dict.deleteButton}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
