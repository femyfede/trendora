"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { HERO_SLIDES } from "@/lib/constants";
import { useStore } from "./store-context";
import { cn } from "@/lib/utils";

export function Hero() {
  const { t } = useStore();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % HERO_SLIDES.length),
      7000
    );
    return () => window.clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[index];

  return (
    <section
      className="relative overflow-hidden bg-brand-800 text-white"
      aria-roledescription="carousel"
      aria-label="Seasonal promotions"
    >
      <div className="absolute inset-0 hero-noise" aria-hidden="true" />

      <div className="absolute inset-y-0 right-0 w-full sm:w-[82%] lg:w-[60%]">
        {HERO_SLIDES.map((item, itemIndex) => (
          <Image
            key={item.image}
            src={item.image}
            alt=""
            fill
            priority={itemIndex === 0}
            sizes="(max-width: 640px) 100vw, 60vw"
            className={cn(
              "object-cover object-[center_22%] transition-opacity duration-1000 ease-out",
              itemIndex === index ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/85 to-brand-900/25 lg:from-brand-800 lg:via-brand-800/55 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-brand-950/15" />
      </div>

      <div
        className="absolute -right-24 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 rounded-full border border-white/10 lg:block"
        aria-hidden="true"
      />

      <div className="container-shell relative z-10 flex min-h-[610px] items-center py-16 lg:min-h-[672px]">
        <div key={index} className="max-w-[560px] animate-fade-up">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/85">
            <span className="h-px w-8 bg-brand-300" />
            {t(slide.eyebrowKey as "hero.eyebrow")}
          </p>
          <h1 className="mt-5 whitespace-pre-line font-display text-[3.05rem] font-extrabold leading-[0.98] tracking-[-0.035em] sm:text-[4.2rem] xl:text-[5rem]">
            {t(slide.titleKey as "hero.title")}
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/80 sm:text-base">
            {t(slide.subKey as "hero.sub")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-4 text-sm font-bold text-ink transition-all duration-300 hover:bg-brand-50 hover:shadow-xl hover:shadow-brand-950/20"
            >
              {t("hero.cta")}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/shop?sort=newest"
              className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold text-white transition hover:border-white/70 hover:bg-white/5"
            >
              New in
            </Link>
          </div>

          <p className="mt-8 flex items-center gap-2 text-xs text-white/65">
            <Sparkles className="h-3.5 w-3.5 text-brand-200" />
            {t(slide.noteKey as "hero.note")}
          </p>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-center gap-2">
        {HERO_SLIDES.map((item, itemIndex) => (
          <button
            key={item.image}
            type="button"
            onClick={() => setIndex(itemIndex)}
            aria-label={`Go to promotion ${itemIndex + 1}`}
            aria-current={itemIndex === index}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              itemIndex === index
                ? "w-7 bg-white"
                : "w-2 bg-white/40 hover:bg-white/70"
            )}
          />
        ))}
      </div>

      <div className="absolute bottom-6 right-6 z-20 hidden text-[11px] font-medium tracking-widest text-white/50 lg:block">
        0{index + 1} / 0{HERO_SLIDES.length}
      </div>
    </section>
  );
}
