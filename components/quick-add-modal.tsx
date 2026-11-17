"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingBag, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { cn, stockLabel } from "@/lib/utils";
import { categoryLabel } from "@/lib/constants";
import { useStore } from "./store-context";
import { QuantitySelector } from "./quantity-selector";
import { Rating } from "./rating";

export function QuickAddModal({
  product,
  open,
  onClose
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const { addToCart, format, language, tr } = useStore();
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSize(product.sizes.length === 1 ? product.sizes[0] : "");
    setColor(product.colors.length === 1 ? product.colors[0].name : "");
    setQty(1);
    setError("");
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
  }, [open, product, onClose]);

  if (!open) return null;

  const soldOut = product.stock <= 0;

  const add = () => {
    if (soldOut) return;
    if (!size) {
      setError(tr("Please choose a size.", "Tafadhali chagua saizi."));
      return;
    }
    if (!color) {
      setError(tr("Please choose a colour.", "Tafadhali chagua rangi."));
      return;
    }
    addToCart({ product, size, color, qty });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[115] flex items-end justify-center bg-ink/55 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white animate-fade-up sm:rounded-3xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-zinc-600 shadow-sm transition hover:text-ink"
          aria-label={tr("Close", "Funga")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid sm:grid-cols-[0.9fr_1.1fr]">
          <div className="relative hidden min-h-[400px] bg-smoke sm:block">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          <div className="p-5 sm:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              {product.brand} · {categoryLabel(product.category, language)}
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight text-ink">
              {product.name}
            </h2>
            {product.reviewCount > 0 && (
              <Rating rating={product.rating} reviewCount={product.reviewCount} className="mt-2" />
            )}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-lg font-bold text-ink">{format(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-sm text-zinc-400 line-through">
                  {format(product.compareAtPrice)}
                </span>
              )}
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">
                  {tr("Size", "Saizi")} {size && <span className="text-brand-700">· {size}</span>}
                </p>
                <Link
                  href={`/product/${product.slug}`}
                  className="text-[11px] font-medium text-brand-700 underline-offset-2 hover:underline"
                  onClick={onClose}
                >
                  {tr("Size guide", "Mwongozo wa saizi")}
                </Link>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSize(item);
                      setError("");
                    }}
                    className={cn(
                      "min-h-[44px] min-w-[48px] rounded-lg border px-3 py-2 text-sm font-semibold transition",
                      size === item
                        ? "border-ink bg-ink text-white"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-ink"
                    )}
                    aria-pressed={size === item}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-ink">
                {tr("Colour", "Rangi")} {color && <span className="text-brand-700">· {color}</span>}
              </p>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {product.colors.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      setColor(item.name);
                      setError("");
                    }}
                    className={cn(
                      "grid h-11 w-11 place-items-center rounded-full border-2 transition",
                      color === item.name
                        ? "border-ink"
                        : "border-transparent hover:border-zinc-300"
                    )}
                    aria-label={item.name}
                    aria-pressed={color === item.name}
                    title={item.name}
                  >
                    <span
                      className="grid h-8 w-8 place-items-center rounded-full border border-black/5"
                      style={{ backgroundColor: item.hex }}
                    >
                      {color === item.name && (
                        <Check
                          className={cn(
                            "m-auto h-3.5 w-3.5",
                            item.name === "Ivory" || item.name === "Sand"
                              ? "text-ink"
                              : "text-white"
                          )}
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <QuantitySelector
                value={qty}
                onChange={setQty}
                max={product.stock}
                disabled={soldOut}
                small
              />
              <span
                className={cn(
                  "text-[11px] font-medium",
                  soldOut
                    ? "text-zinc-400"
                    : product.stock <= 5
                      ? "text-amber-600"
                      : "text-emerald-700"
                )}
              >
                {stockLabel(product.stock, language)}
              </span>
            </div>

            {error && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={add}
              disabled={soldOut}
              className="btn-primary mt-4 w-full"
            >
              <ShoppingBag className="h-4 w-4" />
              {soldOut ? tr("Sold out", "Imeisha") : tr("Add to cart", "Weka kwenye kikapu")}
            </button>

            <Link
              href={`/product/${product.slug}`}
              onClick={onClose}
              className="mt-3 block text-center text-xs font-medium text-zinc-500 underline-offset-2 hover:text-brand-700 hover:underline"
            >
              {tr("See full product details", "Tazama maelezo kamili ya bidhaa")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
