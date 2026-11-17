"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, Search, X, SearchX } from "lucide-react";
import type { Product } from "@/lib/types";
import { CATEGORIES, SIZE_OPTIONS, categoryLabel } from "@/lib/constants";
import { ProductCard } from "@/components/product-card";
import { useStore } from "@/components/store-context";
import { cn, matchesSearch } from "@/lib/utils";

type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating" | "popularity";

const SORTS: { value: SortKey; en: string; sw: string }[] = [
  { value: "featured", en: "Recommended", sw: "Tunazopendekeza" },
  { value: "newest", en: "Newest", sw: "Mpya kwanza" },
  { value: "popularity", en: "Most popular", sw: "Zinazouzika zaidi" },
  { value: "rating", en: "Top rated", sw: "Zenye maoni bora" },
  { value: "price-asc", en: "Price: low to high", sw: "Bei: chini kwenda juu" },
  { value: "price-desc", en: "Price: high to low", sw: "Bei: juu kwenda chini" }
];

const PRICE_RANGES = [
  { value: "all", en: "Any price", sw: "Bei yoyote", min: 0, max: Infinity },
  { value: "under-50k", en: "Under TZS 50,000", sw: "Chini ya TZS 50,000", min: 0, max: 50000 },
  { value: "50k-100k", en: "TZS 50,000 – 100,000", sw: "TZS 50,000 – 100,000", min: 50000, max: 100000 },
  { value: "100k-150k", en: "TZS 100,000 – 150,000", sw: "TZS 100,000 – 150,000", min: 100000, max: 150000 },
  { value: "over-150k", en: "Over TZS 150,000", sw: "Zaidi ya TZS 150,000", min: 150000, max: Infinity }
];

const PAGE_SIZE = 12;

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
  const { language, tr } = useStore();
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
  const [visible, setVisible] = useState(PAGE_SIZE);
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
    products.forEach((product) => product.colors.forEach((color) => map.set(color.name, color.hex)));
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
    const range = PRICE_RANGES.find((item) => item.value === priceRange) ?? PRICE_RANGES[0];

    const list = products.filter((product) => {
      if (!matchesSearch(product, query)) return false;
      if (category && product.category !== category) return false;
      if (sizes.length && !product.sizes.some((size) => sizes.includes(size))) return false;
      if (colors.length && !product.colors.some((color) => colors.includes(color.name))) return false;
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
    setVisible(PAGE_SIZE);
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

  const heading = category ? categoryLabel(category, language) : tr("All products", "Bidhaa zote");
  const countLabel = tr(
    `${filtered.length} ${filtered.length === 1 ? "product" : "products"}`,
    `Bidhaa ${filtered.length}`
  );

  const filterHeading = "mb-3 text-xs font-bold uppercase tracking-[0.14em] text-ink";

  const filters = (
    <div className="space-y-7">
      <fieldset>
        <legend className={filterHeading}>{tr("Category", "Aina")}</legend>
        <div className="space-y-1">
          {CATEGORIES.map((item) => (
            <label
              key={item.value}
              className="flex min-h-[40px] cursor-pointer items-center gap-3 text-sm text-zinc-700 transition hover:text-ink"
            >
              <input
                type="checkbox"
                checked={category === item.value}
                onChange={() => setCategory(category === item.value ? "" : item.value)}
                className="h-4 w-4 rounded border-zinc-300 accent-brand-700"
              />
              <span className="flex-1">{language === "sw" ? item.swLabel : item.label}</span>
              <span className="text-xs text-zinc-400">
                {products.filter((product) => product.category === item.value).length}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {sizeOptions.length > 0 && (
        <div className="border-t border-zinc-100 pt-6"><fieldset>
          <legend className={filterHeading}>{tr("Size", "Saizi")}</legend>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSizes(toggle(sizes, size))}
                className={cn(
                  "min-h-[40px] min-w-[44px] rounded-lg border px-2.5 text-xs font-semibold transition",
                  sizes.includes(size)
                    ? "border-ink bg-ink text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-ink"
                )}
                aria-pressed={sizes.includes(size)}
              >
                {size === "One Size" ? tr("One size", "Saizi moja") : size}
              </button>
            ))}
          </div>
        </fieldset></div>
      )}

      {colorOptions.length > 0 && (
        <div className="border-t border-zinc-100 pt-6"><fieldset>
          <legend className={filterHeading}>{tr("Colour", "Rangi")}</legend>
          <div className="grid grid-cols-2 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setColors(toggle(colors, color.name))}
                className={cn(
                  "flex min-h-[40px] items-center gap-2 rounded-lg border px-2 text-left text-xs font-medium transition",
                  colors.includes(color.name)
                    ? "border-ink bg-zinc-50 text-ink"
                    : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
                )}
                aria-pressed={colors.includes(color.name)}
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="truncate">{color.name}</span>
              </button>
            ))}
          </div>
        </fieldset></div>
      )}

      <div className="border-t border-zinc-100 pt-6">
        <label htmlFor="price-range" className={cn(filterHeading, "block")}>
          {tr("Price", "Bei")}
        </label>
        <select
          id="price-range"
          value={priceRange}
          onChange={(event) => setPriceRange(event.target.value)}
          className="field py-2.5"
        >
          {PRICE_RANGES.map((range) => (
            <option key={range.value} value={range.value}>
              {tr(range.en, range.sw)}
            </option>
          ))}
        </select>
      </div>

      {brandOptions.length > 1 && (
        <div className="border-t border-zinc-100 pt-6"><fieldset>
          <legend className={filterHeading}>{tr("Brand", "Chapa")}</legend>
          <div className="space-y-1">
            {brandOptions.map((brand) => (
              <label
                key={brand}
                className="flex min-h-[40px] cursor-pointer items-center gap-3 text-sm text-zinc-700 transition hover:text-ink"
              >
                <input
                  type="checkbox"
                  checked={brands.includes(brand)}
                  onChange={() => setBrands(toggle(brands, brand))}
                  className="h-4 w-4 rounded border-zinc-300 accent-brand-700"
                />
                {brand}
              </label>
            ))}
          </div>
        </fieldset></div>
      )}

      <div className="border-t border-zinc-100 pt-6">
        <label className="flex min-h-[40px] cursor-pointer items-center justify-between text-sm font-medium text-zinc-700">
          {tr("Only show items in stock", "Onyesha zilizopo tu")}
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
      <div className="border-b border-zinc-200/70 bg-sand">
        <div className="container-shell py-8 sm:py-10">
          <nav aria-label={tr("Breadcrumb", "Ulipo")} className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Link href="/" className="transition hover:text-brand-700">
              {tr("Home", "Mwanzo")}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/shop" className="transition hover:text-brand-700">
              {tr("Products", "Bidhaa")}
            </Link>
            {category && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-ink">{heading}</span>
              </>
            )}
          </nav>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="section-title">{heading}</h1>
              <p className="mt-2 max-w-xl text-base text-zinc-600">
                {tr(
                  "Choose the size, colour and price that suit you. Pay when your order arrives.",
                  "Chagua saizi, rangi na bei inayokufaa. Unalipa mzigo ukifika."
                )}
              </p>
            </div>
            <p className="text-sm font-medium text-zinc-500" aria-live="polite">
              {countLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="container-shell py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[250px_1fr] lg:gap-10">
          <aside className="hidden lg:block" aria-label={tr("Filters", "Chuja")}>
            <div className="sticky top-24">
              <div className="mb-5 flex items-center justify-between">
                <p className="font-display text-base font-bold">{tr("Filters", "Chuja")}</p>
                {activeCount > 0 && (
                  <button type="button" onClick={clearAll} className="text-sm font-semibold text-brand-700 hover:underline">
                    {tr("Clear all", "Futa zote")} ({activeCount})
                  </button>
                )}
              </div>
              <div className="max-h-[calc(100vh-9rem)] overflow-y-auto pr-2 no-scrollbar">{filters}</div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={tr("Search products…", "Tafuta bidhaa…")}
                    className="field py-2.5 pl-9 pr-9"
                    aria-label={tr("Search products", "Tafuta bidhaa")}
                    enterKeyHint="search"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-zinc-400 hover:text-ink"
                      aria-label={tr("Clear search", "Futa utafutaji")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="inline-flex min-h-[46px] shrink-0 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-semibold text-ink transition hover:border-zinc-400 lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {tr("Filter", "Chuja")}
                  {activeCount > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-700 px-1 text-[10px] text-white">
                      {activeCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between gap-3">
                {activeCount > 0 && (
                  <button type="button" onClick={clearAll} className="text-sm font-semibold text-brand-700 hover:underline lg:hidden">
                    {tr("Clear all", "Futa zote")}
                  </button>
                )}
                <label htmlFor="sort" className="sr-only">
                  {tr("Sort by", "Panga kwa")}
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortKey)}
                  className="min-h-[46px] cursor-pointer rounded-xl border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-brand-600"
                >
                  {SORTS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {tr("Sort: ", "Panga: ")}
                      {tr(item.en, item.sw)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-sand px-6 py-16 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-zinc-400 shadow-sm">
                  <SearchX className="h-6 w-6" />
                </span>
                <h2 className="mt-5 font-display text-xl font-bold">
                  {products.length === 0
                    ? tr("No products yet", "Bado hakuna bidhaa")
                    : tr("No products match your search", "Hakuna bidhaa zinazolingana na ulichotafuta")}
                </h2>
                <p className="mt-2 max-w-sm text-sm text-zinc-600">
                  {products.length === 0
                    ? tr("New products will appear here soon.", "Bidhaa mpya zitaonekana hapa hivi karibuni.")
                    : tr(
                        "Try removing a filter or searching for another word.",
                        "Jaribu kuondoa kichujio au tafuta kwa neno lingine."
                      )}
                </p>
                {products.length > 0 && (
                  <button type="button" onClick={clearAll} className="btn-primary mt-6">
                    {tr("Clear filters", "Futa vichujio")}
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {filtered.slice(0, visible).map((product, index) => (
                    <ProductCard key={product.id} product={product} priority={index < 4} />
                  ))}
                </div>

                <div className="mt-10 flex flex-col items-center gap-3">
                  <p className="text-sm text-zinc-500">
                    {tr(
                      `Showing ${Math.min(visible, filtered.length)} of ${filtered.length}`,
                      `Unaona ${Math.min(visible, filtered.length)} kati ya ${filtered.length}`
                    )}
                  </p>
                  {visible < filtered.length && (
                    <button
                      type="button"
                      onClick={() => setVisible((current) => current + PAGE_SIZE)}
                      className="btn-outline min-w-[200px]"
                    >
                      {tr("Show more", "Onyesha zaidi")}
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
            aria-label={tr("Close filters", "Funga vichujio")}
          />
          <div
            className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white shadow-lift animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label={tr("Filters", "Chuja")}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <div>
                <p className="font-display text-lg font-bold">{tr("Filters", "Chuja")}</p>
                {activeCount > 0 && (
                  <button type="button" onClick={clearAll} className="text-sm font-semibold text-brand-700 hover:underline">
                    {tr("Clear all", "Futa zote")} ({activeCount})
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-ink"
                aria-label={tr("Close filters", "Funga vichujio")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{filters}</div>
            <div className="border-t border-zinc-100 p-4" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
              <button type="button" onClick={() => setFiltersOpen(false)} className="btn-primary w-full">
                {tr(`Show ${filtered.length} products`, `Onyesha bidhaa ${filtered.length}`)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
