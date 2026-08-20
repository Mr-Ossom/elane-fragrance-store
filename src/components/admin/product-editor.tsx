"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import type { Category, FragranceFamily, Gender } from "@/types";
import type { ProductEditorData } from "@/lib/data-access/admin-store";
import {
  adminDeleteProductImage,
  adminDeleteProduct,
  adminDeleteVariant,
  adminSaveProduct,
  adminSaveProductImage,
  adminSaveVariant,
  adminUploadProductImage,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GENDERS: Gender[] = ["women", "men", "unisex"];
const FAMILIES: FragranceFamily[] = ["Fresh", "Woody", "Sweet", "Floral", "Oud", "Citrus", "Musky", "Oriental"];

interface VariantRow {
  id?: string;
  size: string;
  price: string;
  salePrice: string;
  stock: string;
  sku: string;
  _removed?: boolean;
}

interface ImageRow {
  id?: string;
  url: string;
  alt: string;
  _removed?: boolean;
}

const emptyNew = (): ProductEditorData => ({
  id: "",
  name: "",
  slug: "",
  brand: "",
  description: "",
  categoryId: "",
  gender: "unisex",
  fragranceFamily: "Fresh",
  topNotes: [],
  heartNotes: [],
  baseNotes: [],
  longevity: "",
  sillage: "",
  occasion: "",
  featured: false,
  bestseller: false,
  newArrival: false,
  sortOrder: 0,
  images: [],
  variants: [],
});

export function ProductEditor({
  product,
  categories,
}: {
  product?: ProductEditorData;
  categories: Category[];
}) {
  const router = useRouter();
  const isNew = !product;
  const [form, setForm] = React.useState<ProductEditorData>(product ?? emptyNew());
  const [variants, setVariants] = React.useState<VariantRow[]>(
    (product?.variants ?? []).map((v) => ({
      id: v.id,
      size: v.size,
      price: String(v.price),
      salePrice: v.salePrice != null ? String(v.salePrice) : "",
      stock: String(v.stock),
      sku: v.sku,
    }))
  );
  const [images, setImages] = React.useState<ImageRow[]>(
    (product?.images ?? []).map((i) => ({ id: i.id, url: i.url, alt: i.alt }))
  );
  const [newImageAlt, setNewImageAlt] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [message, setMessage] = React.useState<{ ok: boolean; text: string } | null>(null);

  function update<K extends keyof ProductEditorData>(key: K, value: ProductEditorData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setMessage(null);
    const fd = new FormData();
    fd.append("file", file);
    const result = await adminUploadProductImage(fd);
    setUploading(false);
    if (!result.ok || !result.url) {
      setMessage({ ok: false, text: result.error ?? "Upload failed" });
      return;
    }
    setImages((prev) => [...prev, { url: result.url!, alt: newImageAlt || form.name }]);
    setNewImageAlt("");
    if (fileRef.current) fileRef.current.value = "";
    setMessage({ ok: true, text: "Image uploaded. Save the product to finalize." });
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const name = form.name.trim();
    if (name.length < 2) {
      setMessage({ ok: false, text: "Product name is required." });
      setSaving(false);
      return;
    }
    if (variants.length === 0) {
      setMessage({ ok: false, text: "Add at least one size/variant before saving." });
      setSaving(false);
      return;
    }
    for (const v of variants) {
      if (!v.size.trim() || !v.price) {
        setMessage({ ok: false, text: "Every variant needs a size and price." });
        setSaving(false);
        return;
      }
    }

    // Determine min price from variants for correct catalog sorting.
    const minPrice = Math.min(...variants.map((v) => Number(v.price) || Infinity));
    const slug = form.slug.trim() ? slugify(form.slug) : slugify(name);

    const result = await adminSaveProduct({
      id: form.id || undefined,
      name,
      slug,
      brand: form.brand.trim(),
      description: form.description,
      categoryId: form.categoryId,
      gender: form.gender,
      fragranceFamily: form.fragranceFamily,
      topNotes: form.topNotes,
      heartNotes: form.heartNotes,
      baseNotes: form.baseNotes,
      longevity: form.longevity || null,
      sillage: form.sillage || null,
      occasion: form.occasion || null,
      featured: form.featured,
      bestseller: form.bestseller,
      newArrival: form.newArrival,
      sortOrder: form.sortOrder,
      minPrice: Number.isFinite(minPrice) ? minPrice : 0,
    });

    if (!result.ok || !result.id) {
      setMessage({ ok: false, text: result.error ?? "Failed to save product" });
      setSaving(false);
      return;
    }
    const productId = result.id;
    setForm((prev) => ({ ...prev, id: productId }));

    // Variants
    for (const v of variants) {
      await adminSaveVariant({
        id: v.id,
        productId,
        size: v.size.trim(),
        price: Number(v.price),
        salePrice: v.salePrice === "" ? null : Number(v.salePrice),
        stock: Number(v.stock) || 0,
        sku: v.sku.trim(),
      });
    }
    for (const v of variants) {
      if (v._removed && v.id) await adminDeleteVariant(v.id);
    }

    // Images
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img._removed) {
        if (img.id) await adminDeleteProductImage(img.id);
        continue;
      }
      await adminSaveProductImage({
        id: img.id,
        productId,
        url: img.url,
        alt: img.alt,
        sortOrder: i + 1,
      });
    }

    setSaving(false);
    if (isNew) {
      router.push(`/admin/products/${productId}`);
    } else {
      router.refresh();
    }
    setMessage({ ok: true, text: "Product saved." });
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirm(`Delete "${product.name}"? This also removes its variants, images and reviews.`)) return;
    const result = await adminDeleteProduct(product.id);
    if (result.ok) router.push("/admin/products");
    else setMessage({ ok: false, text: result.error ?? "Failed to delete product" });
  }

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={15} /> Back to products
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-serif font-semibold">{isNew ? "New product" : form.name}</h1>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="outline" onClick={handleDelete} className="border-destructive/50 text-destructive hover:bg-destructive/10">
              <Trash2 size={15} /> Delete
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save product
          </Button>
        </div>
      </div>

      {message && (
        <p
          className={cn(
            "mt-4 rounded-sm border p-3 text-sm",
            message.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-destructive/40 bg-destructive/10 text-destructive"
          )}
        >
          {message.text}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main details */}
        <div className="space-y-4 rounded-sm border border-border bg-background p-5 lg:col-span-2">
          <h2 className="font-medium">Product details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Name *">
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={fieldClass}
                placeholder="Midnight Oud"
              />
            </Labeled>
            <Labeled label="Brand">
              <input
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
                className={fieldClass}
                placeholder="Byredo"
              />
            </Labeled>
            <Labeled label="URL slug">
              <input
                value={form.slug}
                onChange={(e) => update("slug", slugify(e.target.value))}
                className={fieldClass}
                placeholder={slugify(form.name) || "auto-generated"}
              />
            </Labeled>
            <Labeled label="Category *">
              <select value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)} className={fieldClass}>
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Labeled>
            <Labeled label="Gender">
              <select value={form.gender} onChange={(e) => update("gender", e.target.value as Gender)} className={fieldClass}>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g[0].toUpperCase() + g.slice(1)}
                  </option>
                ))}
              </select>
            </Labeled>
            <Labeled label="Fragrance family">
              <select
                value={form.fragranceFamily}
                onChange={(e) => update("fragranceFamily", e.target.value as FragranceFamily)}
                className={fieldClass}
              >
                {FAMILIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Labeled>
            <Labeled label="Longevity">
              <input value={form.longevity ?? ""} onChange={(e) => update("longevity", e.target.value)} className={fieldClass} placeholder="Long lasting" />
            </Labeled>
            <Labeled label="Sillage">
              <input value={form.sillage ?? ""} onChange={(e) => update("sillage", e.target.value)} className={fieldClass} placeholder="Moderate" />
            </Labeled>
            <Labeled label="Sort order">
              <input
                type="number"
                value={String(form.sortOrder)}
                onChange={(e) => update("sortOrder", Number(e.target.value) || 0)}
                className={fieldClass}
              />
            </Labeled>
            <Labeled label="Notes splitter (comma separated)">
              <input
                value={form.occasion ?? ""}
                onChange={(e) => update("occasion", e.target.value)}
                className={fieldClass}
                placeholder="Evening / Formal"
              />
            </Labeled>
          </div>

          <Labeled label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={5}
              className={cn(fieldClass, "resize-y")}
            />
          </Labeled>

          <div className="grid gap-4 sm:grid-cols-3">
            <NotesField label="Top notes" value={form.topNotes} onChange={(v) => update("topNotes", v)} />
            <NotesField label="Heart notes" value={form.heartNotes} onChange={(v) => update("heartNotes", v)} />
            <NotesField label="Base notes" value={form.baseNotes} onChange={(v) => update("baseNotes", v)} />
          </div>

          <div className="flex flex-wrap gap-5 pt-1">
            <Toggle label="Featured" checked={form.featured} onChange={(v) => update("featured", v)} />
            <Toggle label="Best seller" checked={form.bestseller} onChange={(v) => update("bestseller", v)} />
            <Toggle label="New arrival" checked={form.newArrival} onChange={(v) => update("newArrival", v)} />
          </div>
        </div>

        {/* Variants */}
        <div className="space-y-4 rounded-sm border border-border bg-background p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Sizes & stock</h2>
            <button
              type="button"
              onClick={() => setVariants((prev) => [...prev, { size: "", price: "", salePrice: "", stock: "0", sku: "" }])}
              className="inline-flex items-center gap-1.5 text-sm text-champagne-deep hover:underline"
            >
              <Plus size={15} /> Add size
            </button>
          </div>
          <div className="space-y-2">
            {variants.map((v, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-2 rounded-sm border border-border p-3 sm:grid-cols-6">
                <input
                  value={v.size}
                  onChange={(e) => setVariants((prev) => prev.map((p, i) => (i === idx ? { ...p, size: e.target.value } : p)))}
                  className={cn(fieldClass, "sm:col-span-2")}
                  placeholder="50ml EDP"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={v.price}
                  onChange={(e) => setVariants((prev) => prev.map((p, i) => (i === idx ? { ...p, price: e.target.value } : p)))}
                  className={fieldClass}
                  placeholder="Price GH₵"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={v.salePrice}
                  onChange={(e) => setVariants((prev) => prev.map((p, i) => (i === idx ? { ...p, salePrice: e.target.value } : p)))}
                  className={fieldClass}
                  placeholder="Sale GH₵"
                />
                <input
                  type="number"
                  min="0"
                  value={v.stock}
                  onChange={(e) => setVariants((prev) => prev.map((p, i) => (i === idx ? { ...p, stock: e.target.value } : p)))}
                  className={fieldClass}
                  placeholder="Stock"
                />
                <div className="flex items-center gap-1.5">
                  <input
                    value={v.sku}
                    onChange={(e) => setVariants((prev) => prev.map((p, i) => (i === idx ? { ...p, sku: e.target.value } : p)))}
                    className={fieldClass}
                    placeholder="SKU"
                  />
                  <button
                    type="button"
                    aria-label="Remove size"
                    onClick={() => setVariants((prev) => {
                      const target = prev[idx];
                      if (target.id) return prev.map((p, i) => (i === idx ? { ...p, _removed: true } : p));
                      return prev.filter((_, i) => i !== idx);
                    })}
                    className="shrink-0 rounded-sm p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            {variants.length === 0 && (
              <p className="rounded-sm border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                No sizes yet — add a size and price to make this product sellable.
              </p>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4 rounded-sm border border-border bg-background p-5 lg:col-span-1">
          <h2 className="font-medium">Images</h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
            {images
              .filter((i) => !i._removed)
              .map((img, idx) => (
                <div key={idx} className="relative overflow-hidden rounded-sm border border-border bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt} className="aspect-square w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-charcoal-deep/70 p-1.5">
                    <span className="truncate text-[10px] text-ivory">{img.alt || "image"}</span>
                    <button
                      type="button"
                      aria-label="Remove image"
                      onClick={() => setImages((prev) => prev.map((p, i) => (i === idx ? { ...p, _removed: true } : p)))}
                      className="shrink-0 rounded-sm p-1 text-white hover:bg-destructive"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-muted-foreground">Upload from device (≤5MB)</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
              className="block w-full text-xs"
            />
            {uploading && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 size={13} className="animate-spin" /> Uploading…
              </p>
            )}
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex gap-2">
              <input
                value={newImageAlt}
                onChange={(e) => setNewImageAlt(e.target.value)}
                className={cn(fieldClass, "flex-1")}
                placeholder="Image label"
              />
              {!isNew && <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  const url = prompt("Paste an image URL (https://…)")
                  if (url?.trim()) {
                    setImages((prev) => [...prev, { url: url.trim(), alt: newImageAlt || form.name }]);
                    setNewImageAlt("");
                  }
                }}
              >
                <ImagePlus size={15} /> Add URL
              </Button>}
            </div>
            {isNew && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Upload size={13} /> Upload an image after saving, then add more URLs here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const fieldClass =
  "w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-champagne-deep";

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs text-muted-foreground">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function NotesField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <Labeled label={label}>
      <input
        value={value.join(", ")}
        onChange={(e) => onChange(e.target.value.split(",").map((n) => n.trim()))}
        className={fieldClass}
        placeholder="Bergamot, Saffron"
      />
    </Labeled>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#8a7a56]" />
      {label}
    </label>
  );
}