"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  SlidersHorizontal,
  Search,
  X,
  SearchX
} from "lucide-react";
import type { Product } from "@/lib/types";
import { CATEGORIES, SIZE_OPTIONS } from "@/lib/constants";
import { ProductCard } from "@/components/product-card";
import { useStore } from "@/components/store-context";
import { cn } from "@/lib/utils";

type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating" | "popularity";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Top rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" }
];

const PRICE_RANGES = [
  { value: "all", label: "Any price", min: 0, max: Infinity },
  { value: "under-50k", label: "Under TZS 50,000", min: 0, max: 50000 },
  { value: "50k-100k", label: "TZS 50,000 – 100,000", min: 50000, max: 100000 },
  { value: "100k-150k", label: "TZS 100,000 – 150,000", min: 100000, max: 150000 },
  { value: "over-150k", label: "Over TZS 150,000", min: 150000, max: Infinity }
];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function ShopClient({
  products,
  initialCategory = "",
  initialQuery = "",
  initialSort = "featured"
}: {
  products: Product[];
  initialCategory?: string;
  initialQuery?: string;
  initialSort?: string;
}) {
  const { language, currency, format } = useStore();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(
    CATEGORIES.some((item) => item.value === initialCategory) ? initialCategory : ""
  );
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState("all");
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<SortKey>(
    SORTS.some((item) => item.value === initialSort) ? (initialSort as SortKey) : "featured"
  );
  const [visible, setVisible] = useState(8);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!filtersOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [filtersOpen]);

  const colorOptions = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((product) =>
      product.colors.forEach((color) => map.set(color.name, color.hex))
    );
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  const brandOptions = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand))).sort(),
    [products]
  );
  const sizeOptions = useMemo(() => {
    const productSizes = new Set(products.flatMap((product) => product.sizes));
    return SIZE_OPTIONS.filter((size) => productSizes.has(size));
  }, [products]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const range = PRICE_RANGES.find((item) => item.value === priceRange) ?? PRICE_RANGES[0];

    const list = products.filter((product) => {
      if (
        normalized &&
        !`${product.name} ${product.category} ${product.brand}`
          .toLowerCase()
          .includes(normalized)
      )
        return false;
      if (category && product.category !== category) return false;
      if (sizes.length && !product.sizes.some((size) => sizes.includes(size))) return false;
      if (colors.length && !product.colors.some((color) => colors.includes(color.name)))
        return false;
      if (brands.length && !brands.includes(product.brand)) return false;
      if (product.price < range.min || product.price > range.max) return false;
      if (inStock && product.stock <= 0) return false;
      return true;
    });

    return list.sort((a, b) => {
      switch (sort) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "popularity":
          return b.sold - a.sold;
        default:
          return Number(b.isBestSeller) - Number(a.isBestSeller) || b.sold - a.sold;
      }
    });
  }, [products, query, category, sizes, colors, brands, priceRange, inStock, sort]);

  useEffect(() => {
    setVisible(8);
  }, [query, category, sizes, colors, brands, priceRange, inStock, sort]);

  const activeCount =
    (category ? 1 : 0) +
    sizes.length +
    colors.length +
    brands.length +
    (priceRange !== "all" ? 1 : 0) +
    (inStock ? 1 : 0);

  const clearAll = () => {
    setCategory("");
    setSizes([]);
    setColors([]);
    setBrands([]);
    setPriceRange("all");
    setInStock(false);
    setQuery("");
  };

  const filters = (
    <div className="space-y-7">
      <div>
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
          Category
        </h3>
        <div className="space-y-2.5">
          {CATEGORIES.map((item) => (
            <label
              key={item.value}
              className="flex cursor-pointer items-center gap-2.5 text-[13px] text-zinc-600 transition hover:text-ink"
            >
              <input
                type="checkbox"
                checked={category === item.value}
                onChange={() => setCategory(category === item.value ? "" : item.value)}
                className="h-4 w-4 rounded border-zinc-300 text-brand-700 accent-brand-700 focus:ring-brand-600"
              />
              <span className="flex-1">{language === "sw" ? item.swLabel : item.label}</span>
              <span className="text-[10px] text-zinc-400">
                {products.filter((product) => product.category === item.value).length}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-6">
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
          Size
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {sizeOptions.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSizes(toggle(sizes, size))}
              className={cn(
                "min-w-[38px] rounded-md border px-2 py-1.5 text-[11px] font-semibold transition",
                sizes.includes(size)
                  ? "border-ink bg-ink text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-ink"
              )}
              aria-pressed={sizes.includes(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-6">
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
          Colour
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => setColors(toggle(colors, color.name))}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-[11px] font-medium transition",
                colors.includes(color.name)
                  ? "border-ink bg-zinc-50 text-ink"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
              )}
              aria-pressed={colors.includes(color.name)}
            >
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: color.hex }}
              />
              <span className="truncate">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-6">
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
          Price
        </h3>
        <label htmlFor="price-range" className="sr-only">
          Price range
        </label>
        <select
          id="price-range"
          value={priceRange}
          onChange={(event) => setPriceRange(event.target.value)}
          className="field py-2.5 text-xs"
        >
          {PRICE_RANGES.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-[10px] text-zinc-400">
          Displaying prices in {currency}.
        </p>
      </div>

      <div className="border-t border-zinc-100 pt-6">
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
          Brand
        </h3>
        <div className="space-y-2.5">
          {brandOptions.map((brand) => (
            <label
              key={brand}
              className="flex cursor-pointer items-center gap-2.5 text-[13px] text-zinc-600 transition hover:text-ink"
            >
              <input
                type="checkbox"
                checked={brands.includes(brand)}
                onChange={() => setBrands(toggle(brands, brand))}
                className="h-4 w-4 rounded border-zinc-300 text-brand-700 accent-brand-700 focus:ring-brand-600"
              />
              {brand}
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-zinc-100 pt-6">
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-ink">
          Availability
        </h3>
        <label className="flex cursor-pointer items-center justify-between text-[13px] text-zinc-600">
          In stock only
          <input
            type="checkbox"
            checked={inStock}
            onChange={(event) => setInStock(event.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 accent-brand-700"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div>
      <div className="border-b border-zinc-200/70 bg-[#F7F8F7]">
        <div className="container-shell py-8 sm:py-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Link href="/" className="transition hover:text-brand-700">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-ink">Shop</span>
            {category && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-ink">{category}</span>
              </>
            )}
          </nav>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="section-title">
                {category
                  ? language === "sw"
                    ? CATEGORIES.find((item) => item.value === category)?.swLabel
                    : category
                  : language === "sw"
                    ? "Bidhaa Zote"
                    : "Shop all"}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-500">
                {language === "sw"
                  ? "Mitindo teule kwa kila siku. Chagua ukubwa, rangi na bei inayokufaa."
                  : "Considered pieces for every day. Filter by size, colour, price and more."}
              </p>
            </div>
            <p className="text-xs font-medium text-zinc-400">
              {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
            </p>
          </div>
        </div>
      </div>

      <div className="container-shell py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="mb-5 flex items-center justify-between">
                <p className="font-display text-sm font-bold">Filters</p>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[11px] font-semibold text-brand-700 hover:underline"
                  >
                    Clear all ({activeCount})
                  </button>
                )}
              </div>
              <div className="max-h-[calc(100vh-9rem)] overflow-y-auto pr-2 no-scrollbar">
                {filters}
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={language === "sw" ? "Tafuta bidhaa..." : "Search products..."}
                    className="field py-2.5 pl-9 pr-8 text-xs"
                    aria-label="Search products"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-ink"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-ink transition hover:border-zinc-400 lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeCount > 0 && (
                    <span className="grid h-4 min-w-4 place-items-center rounded-full bg-brand-700 px-1 text-[9px] text-white">
                      {activeCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between gap-3">
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[11px] font-semibold text-brand-700 hover:underline lg:hidden"
                  >
                    Clear all
                  </button>
                )}
                <label htmlFor="sort" className="sr-only">
                  Sort by
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortKey)}
                  className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs font-medium text-zinc-700 outline-none focus:border-brand-600"
                >
                  {SORTS.map((item) => (
                    <option key={item.value} value={item.value}>
                      Sort: {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-[#FAFBFB] px-6 py-20 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-zinc-400 shadow-sm">
                  <SearchX className="h-6 w-6" />
                </span>
                <h2 className="mt-5 font-display text-xl font-bold">
                  No pieces match your filters
                </h2>
                <p className="mt-2 max-w-sm text-sm text-zinc-500">
                  Try removing a filter or searching for something else.
                </p>
                <button type="button" onClick={clearAll} className="btn-primary mt-6">
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {filtered.slice(0, visible).map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priority={index < 4}
                    />
                  ))}
                </div>

                <div className="mt-10 flex flex-col items-center gap-3">
                  <p className="text-[11px] text-zinc-400">
                    Showing {Math.min(visible, filtered.length)} of {filtered.length}
                  </p>
                  {visible < filtered.length && (
                    <button
                      type="button"
                      onClick={() => setVisible((current) => current + 8)}
                      className="btn-outline min-w-[190px]"
                    >
                      Load more pieces
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[105] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
            aria-label="Close filters"
          />
          <div
            className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white shadow-lift animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <div>
                <p className="font-display text-lg font-bold">Filters</p>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[11px] font-semibold text-brand-700 hover:underline"
                  >
                    Clear all ({activeCount})
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-ink"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{filters}</div>
            <div className="border-t border-zinc-100 p-4">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="btn-primary w-full"
              >
                Show {filtered.length} pieces
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
