"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import { useStore } from "./store-context";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/i18n";

export function ProductGridSection({
  titleKey,
  subtitleKey,
  kickerKey,
  products,
  ctaKey,
  ctaHref,
  footerCtaKey,
  footerCtaHref,
  align = "center",
  muted = false,
  showNewCta = false
}: {
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  kickerKey?: TranslationKey;
  products: Product[];
  ctaKey?: TranslationKey;
  ctaHref?: string;
  footerCtaKey?: TranslationKey;
  footerCtaHref?: string;
  align?: "center" | "left";
  muted?: boolean;
  showNewCta?: boolean;
}) {
  const { t } = useStore();

  return (
    <section className={cn(muted ? "border-y border-zinc-200/70 bg-[#F6F7F6]" : "")}>
      <div className="container-shell py-14 sm:py-16 lg:py-20">
        <div
          className={cn(
            "flex flex-col gap-5",
            align === "center"
              ? "items-center text-center"
              : "sm:flex-row sm:items-end sm:justify-between"
          )}
        >
          <div className={align === "center" ? "max-w-2xl" : "max-w-xl"}>
            {kickerKey && <p className="section-kicker">{t(kickerKey)}</p>}
            <h2 className="section-title mt-1.5">{t(titleKey)}</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-zinc-500">
              {t(subtitleKey)}
            </p>
          </div>
          {ctaKey && ctaHref && (
            <Link
              href={ctaHref}
              className={cn(
                "group inline-flex shrink-0 items-center gap-2 rounded-full border border-zinc-300 px-5 py-2.5 text-xs font-semibold text-ink transition hover:border-brand-700 hover:text-brand-700",
                align === "center" && "hidden"
              )}
            >
              {t(ctaKey)}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:mt-10 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 2} />
          ))}
        </div>

        {footerCtaKey && footerCtaHref && (
          <div className="mt-9 flex justify-center">
            <Link href={footerCtaHref} className="btn-primary group">
              {t(footerCtaKey)}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        {showNewCta && ctaKey && ctaHref && align === "left" && (
          <div className="mt-8 flex justify-start sm:hidden">
            <Link href={ctaHref} className="btn-primary">
              {t(ctaKey)}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
