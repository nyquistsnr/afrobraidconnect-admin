"use client";

import { useMemo, useState, useEffect } from "react";
import { ImagePlus, Languages, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { styleCatalogApi } from "@/lib/api/style-catalog-client";
import type { AdminAddon, AdminStyle, StyleCategory, TranslationSource } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";

type Tab = "styles" | "categories" | "addons";
type CatalogDictionary = Dictionary["dashboard"]["styleCatalog"];
type Props = { accessToken: string; lang: Locale; dict: CatalogDictionary; initialStyles: AdminStyle[]; initialCategories: StyleCategory[]; initialAddons: AdminAddon[] };

function localized(value: { name_en: string; name_de: string | null; name_fr: string | null }, lang: Locale) {
  return lang === "de" ? value.name_de || value.name_en : lang === "fr" ? value.name_fr || value.name_en : value.name_en;
}

function description(style: AdminStyle, lang: Locale) {
  return lang === "de" ? style.description_de || style.description_en : lang === "fr" ? style.description_fr || style.description_en : style.description_en;
}

function TranslationStatus({ de, fr }: { de: TranslationSource; fr: TranslationSource }) {
  return <div className="flex items-center gap-1.5 text-xs"><Languages className="size-3.5 text-muted-foreground" />{[["DE", de], ["FR", fr]].map(([locale, source]) => <span key={locale} className="rounded-full bg-muted px-2 py-0.5 font-semibold text-muted-foreground">{locale} {source || "—"}</span>)}</div>;
}

export function StyleCatalogManager({ accessToken, lang, dict, initialStyles, initialCategories, initialAddons }: Props) {
  const [tab, setTab] = useState<Tab>("styles");
  const [styles, setStyles] = useState(initialStyles);
  const [categories, setCategories] = useState(initialCategories);
  const [addons, setAddons] = useState(initialAddons);
  const [search, setSearch] = useState("");
  const [styleModal, setStyleModal] = useState<AdminStyle | "new" | null>(null);
  const [itemModal, setItemModal] = useState<{ kind: "category" | "addon"; item: StyleCategory | AdminAddon | "new" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<{ kind: Tab; id: string } | null>(null);

  const refresh = async () => {
    const [nextStyles, nextCategories, nextAddons] = await Promise.all([styleCatalogApi.styles(accessToken, lang, 1, search), styleCatalogApi.categories(accessToken, lang), styleCatalogApi.addons(accessToken, lang)]);
    setStyles(nextStyles.items); setCategories(nextCategories); setAddons(nextAddons);
  };
  
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const nextStyles = await styleCatalogApi.styles(accessToken, lang, 1, search);
        setStyles(nextStyles.items);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Search failed");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, accessToken, lang]);
  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      if (deleting.kind === "styles") await styleCatalogApi.deleteStyle(deleting.id, accessToken, lang);
      if (deleting.kind === "categories") await styleCatalogApi.deleteCategory(deleting.id, accessToken, lang);
      if (deleting.kind === "addons") await styleCatalogApi.deleteAddon(deleting.id, accessToken, lang);
      await refresh(); setDeleting(null); toast.success(dict.deleted);
    } catch (error) { toast.error(error instanceof Error ? error.message : dict.saveError); } finally { setBusy(false); }
  };
  const openNew = () => tab === "styles" ? setStyleModal("new") : setItemModal({ kind: tab === "categories" ? "category" : "addon", item: "new" });

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-medium text-brand">{dict.eyebrow}</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">{dict.title}</h1><p className="mt-1 text-sm text-muted-foreground">{dict.subtitle}</p></div><Button className="w-full sm:w-auto" onClick={openNew}><Plus className="size-4" />{tab === "styles" ? dict.addStyle : tab === "categories" ? dict.addCategory : dict.addAddon}</Button></div>
    <div className="flex gap-6 border-b border-border">{(["styles", "categories", "addons"] as Tab[]).map((key) => <button key={key} onClick={() => setTab(key)} className={`border-b-2 px-1 pb-3 text-sm font-semibold ${tab === key ? "border-brand text-brand" : "border-transparent text-muted-foreground"}`}>{dict.tabs[key]}</button>)}</div>
    {tab === "styles" && <><div className="max-w-md"><Input label={dict.searchLabel} icon={Search} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={dict.searchPlaceholder} /></div><div className="grid gap-4 lg:grid-cols-2">{styles.map((style) => <article key={style.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"><div className="flex gap-4 p-4">{style.images[0] ? <img src={style.images[0].url} alt="" className="size-20 rounded-lg object-cover" /> : <div className="flex size-20 items-center justify-center rounded-lg bg-muted"><ImagePlus className="size-5" /></div>}<div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><div><h2 className="font-semibold">{localized(style, lang)}</h2><p className="text-xs text-muted-foreground">{localized(categories.find((category) => category.id === style.category_id) || { name_en: dict.uncategorized, name_de: null, name_fr: null }, lang)}</p></div><Actions onEdit={() => setStyleModal(style)} onDelete={() => setDeleting({ kind: "styles", id: style.id })} /></div><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{description(style, lang) || dict.noDescription}</p></div></div><div className="flex items-center justify-between border-t border-border px-4 py-3"><TranslationStatus de={style.name_de_source} fr={style.name_fr_source} /><span className="text-xs text-muted-foreground">{style.images.length}/6 · {style.variations.length} {dict.variations}</span></div></article>)}{styles.length === 0 && <Empty text={dict.emptyStyles} />}</div></>}
    {tab === "categories" && <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{categories.map((category) => <CatalogCard key={category.id} name={localized(category, lang)} subtitle={`${dict.order} ${category.display_order} · ${category.slug}`} de={category.name_de_source} fr={category.name_fr_source} onEdit={() => setItemModal({ kind: "category", item: category })} onDelete={() => setDeleting({ kind: "categories", id: category.id })} />)}{!categories.length && <Empty text={dict.emptyCategories} />}</div>}
    {tab === "addons" && <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{addons.map((addon) => <CatalogCard key={addon.id} name={localized(addon, lang)} subtitle={addon.suggested_price ? `${dict.suggestedPrice} €${addon.suggested_price}` : dict.noSuggestedPrice} de={addon.name_de_source} fr={addon.name_fr_source} onEdit={() => setItemModal({ kind: "addon", item: addon })} onDelete={() => setDeleting({ kind: "addons", id: addon.id })} />)}{!addons.length && <Empty text={dict.emptyAddons} />}</div>}
    <StyleEditor item={styleModal} categories={categories} token={accessToken} lang={lang} dict={dict} onClose={() => setStyleModal(null)} onSaved={async () => { await refresh(); setStyleModal(null); }} />
    <ItemEditor state={itemModal} token={accessToken} lang={lang} dict={dict} onClose={() => setItemModal(null)} onSaved={async () => { await refresh(); setItemModal(null); }} />
    <Modal open={!!deleting} onClose={() => setDeleting(null)} labelledBy="catalog-delete"><div className="space-y-4"><h2 id="catalog-delete" className="text-lg font-bold">{dict.deleteTitle}</h2><p className="text-sm text-muted-foreground">{dict.deleteDescription}</p><div className="flex justify-end gap-2"><Button className="w-auto" variant="ghost" onClick={() => setDeleting(null)}>{dict.cancel}</Button><Button className="w-auto bg-red-600 hover:bg-red-700" disabled={busy} onClick={remove}>{busy ? dict.deleting : dict.delete}</Button></div></div></Modal>
  </div>;
}

function Actions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) { return <div className="flex"><button aria-label="Edit" onClick={onEdit} className="p-1.5"><Pencil className="size-4" /></button><button aria-label="Delete" onClick={onDelete} className="p-1.5 text-red-600"><Trash2 className="size-4" /></button></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{text}</div>; }
function CatalogCard({ name, subtitle, de, fr, onEdit, onDelete }: { name: string; subtitle: string; de: TranslationSource; fr: TranslationSource; onEdit: () => void; onDelete: () => void }) { return <div className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex justify-between"><div><h2 className="font-semibold">{name}</h2><p className="mt-1 text-sm text-muted-foreground">{subtitle}</p></div><Actions onEdit={onEdit} onDelete={onDelete} /></div><div className="mt-3"><TranslationStatus de={de} fr={fr} /></div></div>; }

function ItemEditor({ state, token, lang, dict, onClose, onSaved }: { state: { kind: "category" | "addon"; item: StyleCategory | AdminAddon | "new" } | null; token: string; lang: Locale; dict: CatalogDictionary; onClose: () => void; onSaved: () => Promise<void> }) {
  if (!state) return null; const existing = state.item === "new" ? null : state.item;
  const save = async (form: FormData) => { const name = String(form.get("name") || "").trim(); if (!name) return; try { if (state.kind === "category") { const body = { name, display_order: Number(form.get("order") || 0) }; existing ? await styleCatalogApi.updateCategory(existing.id, body, token, lang) : await styleCatalogApi.createCategory(body, token, lang); } else { const body = { name, suggested_price: String(form.get("price") || "") || undefined }; existing ? await styleCatalogApi.updateAddon(existing.id, body, token, lang) : await styleCatalogApi.createAddon(body, token, lang); } toast.success(dict.saved); await onSaved(); } catch (error) { toast.error(error instanceof Error ? error.message : dict.saveError); } };
  return <Modal open onClose={onClose} labelledBy="catalog-item"><form action={save} className="space-y-4"><div className="flex justify-between"><h2 id="catalog-item" className="text-lg font-bold">{existing ? dict.edit : dict.add} {state.kind === "category" ? dict.tabs.categories : dict.tabs.addons}</h2><button type="button" onClick={onClose}><X className="size-5" /></button></div><Input label={dict.englishName} showLabel name="name" defaultValue={existing?.name_en} required />{state.kind === "category" ? <Input label={dict.displayOrder} showLabel name="order" type="number" defaultValue={(existing as StyleCategory | null)?.display_order ?? 0} /> : <Input label={dict.suggestedPrice} showLabel name="price" type="number" min="0" step="0.01" defaultValue={(existing as AdminAddon | null)?.suggested_price ?? ""} />}<Button>{dict.save}</Button></form></Modal>;
}

function StyleEditor({ item, categories, token, lang, dict, onClose, onSaved }: { item: AdminStyle | "new" | null; categories: StyleCategory[]; token: string; lang: Locale; dict: CatalogDictionary; onClose: () => void; onSaved: () => Promise<void> }) {
  const [categoryId, setCategoryId] = useState("");
  useEffect(() => {
    setCategoryId(item && item !== "new" ? item.category_id || "" : "");
  }, [item]);
  if (!item) return null; const existing = item === "new" ? null : item;
  const save = async (form: FormData) => { const name = String(form.get("name") || "").trim(); if (!name) return; try { const body = { name, description: String(form.get("description") || "") || undefined, category_id: categoryId || undefined, ...(existing ? { is_active: form.get("active") === "on" } : {}) }; existing ? await styleCatalogApi.updateStyle(existing.id, body, token, lang) : await styleCatalogApi.createStyle(body, token, lang); toast.success(dict.saved); await onSaved(); } catch (error) { toast.error(error instanceof Error ? error.message : dict.saveError); } };
  return <Modal open onClose={onClose} labelledBy="catalog-style" size="lg"><div className="space-y-4"><form action={save} className="space-y-4"><div className="flex justify-between"><div><h2 id="catalog-style" className="text-lg font-bold">{existing ? dict.editStyle : dict.addStyle}</h2><p className="text-sm text-muted-foreground">{dict.authoringHint}</p></div><button type="button" onClick={onClose}><X className="size-5" /></button></div><Input label={dict.englishName} showLabel name="name" defaultValue={existing?.name_en} required /><Select label={dict.category} showLabel value={categoryId} onChange={setCategoryId} options={[{ value: "", label: dict.uncategorized }, ...categories.map(c => ({ value: c.id, label: localized(c, lang) }))]} /><label className="block text-sm font-medium">{dict.englishDescription}<textarea name="description" defaultValue={existing?.description_en || ""} className="mt-1.5 min-h-28 w-full border border-border bg-input px-3 py-3" /></label>{existing && <label className="flex gap-2 text-sm"><input name="active" type="checkbox" defaultChecked={existing.is_active} />{dict.publish}</label>}<Button>{dict.save}</Button></form>{existing && <StyleDetails style={existing} token={token} lang={lang} onChanged={onSaved} />}</div></Modal>;
}

function StyleDetails({ style, token, lang, onChanged }: { style: AdminStyle; token: string; lang: Locale; onChanged: () => Promise<void> }) {
  const addVariation = async (form: FormData) => { const name = String(form.get("variation") || "").trim(); if (!name) return; try { await styleCatalogApi.createVariation(style.id, { name, display_order: style.variations.length + 1 }, token, lang); await onChanged(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not add variation."); } };
  const upload = async (file?: File) => { if (!file) return; if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5_242_880) return toast.error("Use a JPEG, PNG, or WEBP under 5MB."); try { const { upload_url, object_key } = await styleCatalogApi.uploadUrl(style.id, file.type, token, lang); const response = await fetch(upload_url, { method: "PUT", headers: { "Content-Type": file.type }, body: file }); if (!response.ok) throw new Error("Image upload failed."); await styleCatalogApi.confirmImage(style.id, object_key, token, lang); await onChanged(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not upload image."); } };
  return <div className="space-y-3 rounded-lg border border-border p-3"><div><p className="text-sm font-semibold">Images</p><div className="mt-2 flex flex-wrap gap-2">{style.images.map((image) => <div key={image.id} className="relative"><img src={image.url} alt="" className="size-16 rounded object-cover" /><button type="button" className="absolute -right-1 -top-1 rounded-full bg-red-600 p-0.5 text-white" onClick={async () => { await styleCatalogApi.deleteImage(style.id, image.id, token, lang); await onChanged(); }}><X className="size-3" /></button></div>)}{style.images.length < 6 && <label className="flex size-16 cursor-pointer items-center justify-center rounded border border-dashed border-border"><ImagePlus className="size-4" /><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(event.target.files?.[0])} /></label>}</div></div><div><p className="text-sm font-semibold">Variations</p>{style.variations.map((variation) => <div key={variation.id} className="flex items-center justify-between text-sm"><span>{localized(variation, lang)}</span><button type="button" className="text-red-600" onClick={async () => { await styleCatalogApi.deleteVariation(style.id, variation.id, token, lang); await onChanged(); }}><Trash2 className="size-4" /></button></div>)}<form action={addVariation} className="mt-2 flex gap-2"><input name="variation" className="min-w-0 flex-1 border border-border bg-input px-3 py-2 text-sm" /><button className="border border-border px-3 text-sm">Add</button></form></div></div>;
}
