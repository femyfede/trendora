"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Store } from "lucide-react";
import { SELECTABLE_REGIONS, SHOP_CATEGORIES } from "@/lib/constants";
import { useStore } from "./store-context";
import { ShopCard, type PublicShop } from "./shop-card";

export function ShopsDirectory({ shops }: { shops: PublicShop[] }) {
  const { tr, language } = useStore();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");

  const regions = useMemo(() => {
    const used = new Set(shops.map((shop) => shop.region));
    const known = SELECTABLE_REGIONS.filter((item) => used.has(item.name)).map((item) => item.name);
    const other = [...used].filter((name) => !known.includes(name));
    return [...known, ...other];
  }, [shops]);

  const categories = useMemo(() => {
    const used = new Set(shops.map((shop) => shop.category));
    return SHOP_CATEGORIES.filter((item) => used.has(item.value));
  }, [shops]);

  const filtered = shops.filter((shop) => {
    const value = query.trim().toLowerCase();
    const haystack = `${shop.name} ${shop.description} ${shop.district} ${shop.physicalLocation}`.toLowerCase();
    if (value && !haystack.includes(value)) return false;
    if (region && shop.region !== region) return false;
    if (category && shop.category !== category) return false;
    return true;
  });

  if (shops.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-sand px-6 py-14 text-center">
        <Store className="mx-auto h-9 w-9 text-zinc-400" />
        <h2 className="mt-3 font-display text-xl font-bold">
          {tr("No shops listed yet", "Bado hakuna maduka yaliyoorodheshwa")}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
          {tr(
            "Shops appear here after their registration is verified. Be one of the first!",
            "Maduka yanaonekana hapa baada ya usajili wake kuthibitishwa. Kuwa miongoni mwa wa kwanza!"
          )}
        </p>
        <Link href="/create-shop" className="btn-primary mt-6">
          {tr("Register your shop", "Sajili duka lako")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[1fr_200px_200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <label htmlFor="shops-search" className="sr-only">
            {tr("Search shops", "Tafuta duka")}
          </label>
          <input
            id="shops-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tr("Search by name or area…", "Tafuta kwa jina au eneo…")}
            className="field pl-9"
          />
        </div>
        <div>
          <label htmlFor="shops-region" className="sr-only">
            {tr("Region", "Mkoa")}
          </label>
          <select id="shops-region" value={region} onChange={(event) => setRegion(event.target.value)} className="field">
            <option value="">{tr("All regions", "Mikoa yote")}</option>
            {regions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="shops-category" className="sr-only">
            {tr("Type of business", "Aina ya biashara")}
          </label>
          <select id="shops-category" value={category} onChange={(event) => setCategory(event.target.value)} className="field">
            <option value="">{tr("All types", "Aina zote")}</option>
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {language === "sw" ? item.swLabel : item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-500" aria-live="polite">
        {tr(`${filtered.length} shops`, `Maduka ${filtered.length}`)}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-sand px-6 py-10 text-center text-sm text-zinc-600">
          {tr("No shops match your search. Try another area or type.", "Hakuna duka linalolingana. Jaribu eneo au aina nyingine.")}
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
