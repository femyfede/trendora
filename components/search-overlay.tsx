"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { useStore } from "./store-context";
import { formatPrice } from "@/lib/utils";

export function SearchOverlay({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { currency, t } = useStore();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return products.filter((product) => product.isBestSeller).slice(0, 5);
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(value) ||
          product.category.toLowerCase().includes(value) ||
          product.brand.toLowerCase().includes(value)
      )
      .slice(0, 6);
  }, [products, query]);

  if (!open) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    onClose();
    router.push(value ? `/shop?q=${encodeURIComponent(value)}` : "/shop");
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex justify-center bg-ink/50 backdrop-blur-sm animate-fade-in sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-white animate-fade-up sm:mt-16 sm:h-auto sm:max-h-[82vh] sm:rounded-3xl">
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-4 sm:px-6">
          <Search className="h-5 w-5 shrink-0 text-brand-700" />
          <form onSubmit={submit} className="flex flex-1 items-center gap-2">
            <label htmlFor="site-search" className="sr-only">
              {t("common.search")}
            </label>
            <input
              ref={inputRef}
              id="site-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("common.search")}
              className="w-full bg-transparent py-2 text-base font-medium text-ink outline-none placeholder:text-zinc-400 sm:text-lg"
              autoComplete="off"
            />
            <button
              type="submit"
              className="hidden rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-800 sm:inline-flex"
            >
              Search
            </button>
          </form>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-ink"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!query && (
            <div className="mb-5">
              <p className="mb-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Browse by category
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(`/shop?category=${encodeURIComponent(category.value)}`);
                    }}
                    className="chip"
                  >
                    {category.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              {query ? "Matching pieces" : "Trending now"}
            </p>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-brand-700" />}
          </div>

          <div className="mt-3 divide-y divide-zinc-100">
            {!loading && results.length === 0 && (
              <div className="py-10 text-center">
                <p className="font-display text-lg font-bold text-ink">
                  No matches for “{query}”
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Try a different name, category or brand.
                </p>
              </div>
            )}
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="group flex items-center gap-4 py-3"
              >
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-smoke">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{product.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {product.category} · {product.brand}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand-800">
                    {formatPrice(product.price, currency)}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-brand-700" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
