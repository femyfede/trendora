"use client";

import { BadgeCheck, MapPin, MessageCircle, Phone, Store } from "lucide-react";
import type { Shop } from "@/lib/types";
import { categoryLabel } from "@/lib/constants";
import { telHref, whatsappNumber } from "@/lib/utils";
import { useStore } from "./store-context";

export type PublicShop = Pick<
  Shop,
  "id" | "name" | "category" | "description" | "region" | "district" | "physicalLocation" | "phone" | "whatsapp"
>;

export function ShopCard({ shop }: { shop: PublicShop }) {
  const { tr, language } = useStore();
  const initials = shop.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-card">
      <div className="flex items-start gap-3">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 font-display text-base font-extrabold text-brand-700"
          aria-hidden="true"
        >
          {initials || <Store className="h-5 w-5" />}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-extrabold leading-tight text-ink">{shop.name}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="font-semibold text-clay-600">{categoryLabel(shop.category, language)}</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              {tr("Verified", "Limethibitishwa")}
            </span>
          </p>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-600">{shop.description}</p>

      <p className="mt-4 flex items-start gap-2 text-sm text-zinc-600">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
        <span>
          {shop.physicalLocation}, {shop.district}, {shop.region}
        </span>
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <a
          href={telHref(shop.phone)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          <Phone className="h-4 w-4" />
          {tr("Call", "Piga simu")}
        </a>
        <a
          href={`https://wa.me/${whatsappNumber(shop.whatsapp || shop.phone)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-emerald-600 hover:text-emerald-700"
        >
          <MessageCircle className="h-4 w-4 text-emerald-600" />
          WhatsApp
        </a>
      </div>
    </article>
  );
}
