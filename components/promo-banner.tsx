"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useStore } from "./store-context";

export function PromoBanner() {
  const { t } = useStore();

  return (
    <section className="container-shell py-4 sm:py-8">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-brand-900 sm:rounded-[2rem]">
        <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative z-10 max-w-xl px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-200">
              <span className="h-px w-7 bg-brand-400" />
              {t("promo.label")}
            </p>
            <h2 className="mt-5 whitespace-pre-line font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.7rem]">
              {t("promo.title")}
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70 sm:text-base">
              {t("promo.sub")}
            </p>
            <Link
              href="/collections"
              className="group mt-8 inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-ink transition hover:bg-brand-50"
            >
              {t("promo.cta")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="relative min-h-[280px] lg:min-h-[480px]">
            <Image
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=85"
              alt="Model wearing a TRENDORA seasonal look"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-[center_20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-brand-900/25 to-transparent lg:from-brand-900/90 lg:via-brand-900/10" />
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-brand-900/50 to-transparent lg:hidden" />

            <div className="absolute bottom-5 right-5 rounded-2xl border border-white/25 bg-white/90 px-5 py-4 text-ink shadow-lift backdrop-blur-md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                New season
              </p>
              <p className="mt-1 font-display text-xl font-extrabold">The 24-piece edit</p>
              <p className="mt-0.5 text-[11px] text-zinc-500">
                Designed in Dar es Salaam
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
