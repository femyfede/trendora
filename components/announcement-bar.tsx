"use client";

import { Phone, Truck } from "lucide-react";
import { useStore } from "./store-context";
import { CURRENCIES, SITE } from "@/lib/constants";
import type { Currency } from "@/lib/types";
import { LanguageSwitch } from "./language-switch";

export function AnnouncementBar() {
  const { currency, setCurrency, t, tr } = useStore();

  return (
    <div className="bg-brand-950 text-white">
      <div className="container-shell flex h-10 items-center justify-between gap-4 text-xs">
        <a
          href={`tel:${SITE.phoneHref}`}
          className="hidden shrink-0 items-center gap-2 font-medium text-white/85 transition hover:text-white sm:flex"
        >
          <Phone className="h-3.5 w-3.5 text-sun-400" />
          {SITE.phone}
        </a>

        <p className="flex min-w-0 flex-1 items-center gap-2 truncate font-medium text-white/85 sm:justify-center">
          <Truck className="hidden h-3.5 w-3.5 shrink-0 text-sun-400 md:block" />
          <span className="truncate">{t("announce.promo")}</span>
        </p>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <label className="sr-only" htmlFor="announce-currency">
            {tr("Currency", "Sarafu")}
          </label>
          <select
            id="announce-currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value as Currency)}
            className="cursor-pointer rounded bg-transparent text-xs font-semibold text-white/85 outline-none transition hover:text-white"
          >
            {CURRENCIES.map((item) => (
              <option key={item.value} value={item.value} className="text-ink">
                {item.label}
              </option>
            ))}
          </select>
          <LanguageSwitch variant="dark" />
        </div>
      </div>
    </div>
  );
}
