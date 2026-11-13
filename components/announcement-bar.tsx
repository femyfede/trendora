"use client";

import { Facebook, Instagram, Phone, Youtube } from "lucide-react";
import { useStore } from "./store-context";
import { CURRENCIES, LANGUAGES, SITE } from "@/lib/constants";
import type { Currency, Language } from "@/lib/types";

export function AnnouncementBar() {
  const { currency, language, setCurrency, setLanguage, t } = useStore();

  return (
    <div className="bg-ink text-white">
      <div className="container-shell flex h-10 items-center justify-between gap-4 text-[11px]">
        <div className="flex shrink-0 items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-brand-300" />
          <a
            href={`tel:${SITE.phoneHref}`}
            className="hidden font-medium tracking-wide text-white/90 transition hover:text-white sm:inline"
          >
            {SITE.phone}
          </a>
          <span className="hidden text-white/40 lg:inline">•</span>
          <span className="hidden text-white/60 lg:inline">
            {t("announce.support")} 24/7
          </span>
        </div>

        <p className="hidden min-w-0 flex-1 truncate text-center font-medium tracking-wide text-white/80 md:block">
          {t("announce.promo")}
        </p>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2.5 md:flex">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="TRENDORA on Facebook"
              className="text-white/70 transition hover:text-white"
            >
              <Facebook className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="TRENDORA on Instagram"
              className="text-white/70 transition hover:text-white"
            >
              <Instagram className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="TRENDORA on YouTube"
              className="text-white/70 transition hover:text-white"
            >
              <Youtube className="h-3.5 w-3.5" />
            </a>
            <span className="h-3 w-px bg-white/20" />
          </div>

          <label className="sr-only" htmlFor="announce-currency">
            Currency
          </label>
          <select
            id="announce-currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value as Currency)}
            className="cursor-pointer rounded bg-transparent text-[11px] font-medium text-white/80 outline-none transition hover:text-white"
          >
            {CURRENCIES.map((item) => (
              <option key={item.value} value={item.value} className="text-ink">
                {item.value}
              </option>
            ))}
          </select>

          <span className="h-3 w-px bg-white/20" />

          <label className="sr-only" htmlFor="announce-language">
            Language
          </label>
          <select
            id="announce-language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
            className="cursor-pointer rounded bg-transparent text-[11px] font-medium uppercase text-white/80 outline-none transition hover:text-white"
          >
            {LANGUAGES.map((item) => (
              <option key={item.value} value={item.value} className="text-ink">
                {item.value}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
