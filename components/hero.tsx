"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Store } from "lucide-react";
import { HERO_SLIDES } from "@/lib/constants";
import type { TranslationKey } from "@/lib/i18n";
import { useStore } from "./store-context";
import { cn } from "@/lib/utils";

export function Hero() {
  const router = useRouter();
  const { t, tr } = useStore();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % HERO_SLIDES.length),
      8000
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  const slide = HERO_SLIDES[index];

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/shop?q=${encodeURIComponent(value)}` : "/shop");
  };

  return (
    <section
      className="relative overflow-hidden bg-brand-950 text-white"
      aria-roledescription="carousel"
      aria-label={tr("Welcome", "Karibu")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="absolute inset-0">
        {HERO_SLIDES.map((item, itemIndex) => (
          <Image
            key={item.image}
            src={item.image}
            alt=""
            fill
            priority={itemIndex === 0}
            sizes="100vw"
            className={cn(
              "object-cover transition-opacity duration-1000 ease-out",
              item.position,
              itemIndex === index ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-950/65 to-brand-950/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-transparent to-transparent" />
      </div>

      <div className="container-shell relative z-10 flex min-h-[560px] items-center py-14 sm:min-h-[600px] lg:min-h-[640px]">
        <div key={index} className="w-full min-w-0 max-w-[600px] animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-sun-400" />
            {t(slide.eyebrowKey as TranslationKey)}
          </p>
          <h1 className="mt-5 whitespace-pre-line font-display text-[2.4rem] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[3.4rem] xl:text-[4rem]">
            {t(slide.titleKey as TranslationKey)}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
            {t(slide.subKey as TranslationKey)}
          </p>

          <form onSubmit={search} role="search" className="mt-7 flex max-w-lg items-center gap-2 rounded-full bg-white p-1.5 shadow-lift">
            <label htmlFor="hero-search" className="sr-only">
              {t("common.search")}
            </label>
            <Search className="ml-2 h-5 w-5 shrink-0 text-zinc-400 sm:ml-3" />
            <input
              id="hero-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={tr("e.g. dress, sandals, kitenge…", "mfano: gauni, viatu, kitenge…")}
              className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-ink outline-none placeholder:text-zinc-400"
              enterKeyHint="search"
            />
            <button type="submit" className="shrink-0 rounded-full bg-clay-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-clay-600 sm:px-5">
              {t("nav.search")}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-ink transition hover:bg-brand-50"
            >
              {t("hero.cta")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/create-shop"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              <Store className="h-4 w-4" />
              {t("hero.cta2")}
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-1">
        {HERO_SLIDES.map((item, itemIndex) => (
          <button
            key={item.image}
            type="button"
            onClick={() => setIndex(itemIndex)}
            aria-label={tr(`Show slide ${itemIndex + 1}`, `Onyesha picha ya ${itemIndex + 1}`)}
            aria-current={itemIndex === index}
            className="grid h-8 w-8 place-items-center"
          >
            <span
              className={cn(
                "block h-2 rounded-full transition-all duration-300",
                itemIndex === index ? "w-7 bg-white" : "w-2 bg-white/45 hover:bg-white/75"
              )}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
