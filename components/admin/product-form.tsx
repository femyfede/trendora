"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { useStore } from "@/components/store-context";
import { cn } from "@/lib/utils";

const empty = {
  name: "",
  slug: "",
  category: "Women" as Category,
  brand: "TRENDORA",
  price: "",
  compareAtPrice: "",
  stock: "10",
  sizes: "S, M, L",
  colors: "Black, Ivory",
  images: "",
  description: "",
  material: "",
  details: "",
  isNew: false,
  isBestSeller: false,
  isActive: true
};

export function AdminProductForm({
  product,
  onClose,
  onSaved
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast, format } = useStore();
  const [form, setForm] = useState({ ...empty });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        slug: product.slug,
        category: product.category,
        brand: product.brand,
        price: String(product.price),
        compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
        stock: String(product.stock),
        sizes: product.sizes.join(", "),
        colors: product.colors.map((color) => color.name).join(", "),
        images: product.images.join("\n"),
        description: product.description,
        material: product.material,
        details: product.details.join("\n"),
        isNew: product.isNew,
        isBestSeller: product.isBestSeller,
        isActive: product.isActive
      });
    } else {
      setForm({ ...empty });
    }
    setError("");
  }, [product]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const set = (key: keyof typeof empty, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        stock: Number(form.stock)
      };
      const response = await fetch(
        product ? `/api/products/${product.id}` : "/api/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save product.");
      toast(product ? "Product updated." : "Product created.");
      onSaved();
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const preview = form.images.split(/[\n,]/).map((item) => item.trim()).filter(Boolean)[0];

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-ink/60 p-3 backdrop-blur-sm animate-fade-in sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={product ? "Edit product" : "Add product"}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={submit}
        className="my-4 w-full max-w-3xl rounded-2xl bg-white shadow-lift animate-fade-up"
      >
        <div className="flex items-start justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-lg font-extrabold">
              {product ? "Edit product" : "Add new product"}
            </h2>
            <p className="text-[11px] text-zinc-500">
              Prices are stored in TZS. Changes appear on the storefront immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-ink"
            aria-label="Close product form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_180px]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-semibold text-zinc-700" htmlFor="admin-name">
                  Name
                </label>
                <input
                  id="admin-name"
                  value={form.name}
                  onChange={(event) => set("name", event.target.value)}
                  required
                  className="field mt-1.5"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-700" htmlFor="admin-brand">
                  Brand
                </label>
                <input
                  id="admin-brand"
                  value={form.brand}
                  onChange={(event) => set("brand", event.target.value)}
                  className="field mt-1.5"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-700" htmlFor="admin-category">
                  Category
                </label>
                <select
                  id="admin-category"
                  value={form.category}
                  onChange={(event) => set("category", event.target.value)}
                  className="field mt-1.5"
                >
                  {CATEGORIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-700" htmlFor="admin-slug">
                  Slug (optional)
                </label>
                <input
                  id="admin-slug"
                  value={form.slug}
                  onChange={(event) => set("slug", event.target.value)}
                  className="field mt-1.5"
                  placeholder="auto-generated"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-700" htmlFor="admin-price">
                  Price (TZS)
                </label>
                <input
                  id="admin-price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(event) => set("price", event.target.value)}
                  required
                  className="field mt-1.5"
                  placeholder="78000"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-700" htmlFor="admin-compare">
                  Compare-at price (TZS)
                </label>
                <input
                  id="admin-compare"
                  type="number"
                  min="0"
                  value={form.compareAtPrice}
                  onChange={(event) => set("compareAtPrice", event.target.value)}
                  className="field mt-1.5"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-700" htmlFor="admin-stock">
                  Stock
                </label>
                <input
                  id="admin-stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) => set("stock", event.target.value)}
                  className="field mt-1.5"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-700" htmlFor="admin-sizes">
                  Sizes
                </label>
                <input
                  id="admin-sizes"
                  value={form.sizes}
                  onChange={(event) => set("sizes", event.target.value)}
                  className="field mt-1.5"
                  placeholder="S, M, L or 37, 38, 39"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-700" htmlFor="admin-colors">
                  Colours
                </label>
                <input
                  id="admin-colors"
                  value={form.colors}
                  onChange={(event) => set("colors", event.target.value)}
                  className="field mt-1.5"
                  placeholder="Black, Ivory, Teal"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-700" htmlFor="admin-images">
                Image URLs (one per line)
              </label>
              <textarea
                id="admin-images"
                value={form.images}
                onChange={(event) => set("images", event.target.value)}
                rows={2}
                className="field mt-1.5 resize-none text-xs"
                placeholder="https://images.unsplash.com/…"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-700" htmlFor="admin-description">
                Description
              </label>
              <textarea
                id="admin-description"
                value={form.description}
                onChange={(event) => set("description", event.target.value)}
                rows={3}
                className="field mt-1.5 resize-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-semibold text-zinc-700" htmlFor="admin-material">
                  Material
                </label>
                <input
                  id="admin-material"
                  value={form.material}
                  onChange={(event) => set("material", event.target.value)}
                  className="field mt-1.5"
                  placeholder="100% cotton"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-zinc-700" htmlFor="admin-details">
                  Details (one per line)
                </label>
                <textarea
                  id="admin-details"
                  value={form.details}
                  onChange={(event) => set("details", event.target.value)}
                  rows={2}
                  className="field mt-1.5 resize-none text-xs"
                  placeholder="Machine wash cold&#10;Relaxed fit"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 rounded-xl bg-smoke/70 px-4 py-3">
              {[
                { key: "isNew" as const, label: "New arrival" },
                { key: "isBestSeller" as const, label: "Best seller" },
                { key: "isActive" as const, label: "Visible in store" }
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-center gap-2 text-[11px] font-medium text-zinc-700"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(form[item.key])}
                    onChange={(event) => set(item.key, event.target.checked)}
                    className="h-4 w-4 accent-brand-700"
                  />
                  {item.label}
                </label>
              ))}
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-[11px] font-medium text-red-600">
                {error}
              </p>
            )}
          </div>

          <div>
            <p className="text-[11px] font-semibold text-zinc-700">Preview</p>
            <div className="relative mt-1.5 aspect-[3/4] overflow-hidden rounded-xl bg-smoke">
              {preview ? (
                <Image
                  src={preview}
                  alt="Product preview"
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center px-3 text-center text-[10px] text-zinc-400">
                  Add an image URL to preview
                </div>
              )}
            </div>
            {form.price && (
              <p className="mt-2 text-xs font-semibold text-ink">
                {format(Number(form.price) || 0)}
              </p>
            )}
            <p className="mt-3 text-[10px] leading-relaxed text-zinc-400">
              Use high-quality portrait images. Colour names are mapped to swatches
              automatically; common names like teal, sand and ivory are supported.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button type="button" onClick={onClose} className="btn-outline py-3">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary py-3">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : product ? (
              "Save changes"
            ) : (
              "Create product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
