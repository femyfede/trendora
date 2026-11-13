"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { useStore } from "./store-context";

export function Categories() {
  const { t, language } = useStore();

  return (
    <section className="container-shell py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-kicker">{t("sections.categories.kicker")}</p>
        <h2 className="section-title mt-2">{t("sections.categories.title")}</h2>
      </div>

      <div className="mt-9 grid grid-cols-4 gap-x-3 gap-y-7 sm:gap-x-5 lg:mt-11 lg:grid-cols-8">
        {CATEGORIES.map((category) => (
          <Link
            key={category.value}
            href={`/shop?category=${encodeURIComponent(category.value)}`}
            className="group flex flex-col items-center text-center"
          >
            <div className="relative aspect-square w-full max-w-[86px] overflow-hidden rounded-full bg-smoke ring-1 ring-zinc-200 transition-all duration-300 group-hover:ring-4 group-hover:ring-brand-200 sm:max-w-[140px]">
              <Image
                src={category.image}
                alt={category.label}
                fill
                sizes="(max-width: 640px) 25vw, 150px"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-brand-900/0 transition group-hover:bg-brand-900/10" />
            </div>
            <span className="mt-3 flex items-center gap-0.5 font-display text-[11px] font-bold leading-tight text-ink transition group-hover:text-brand-700 sm:text-[13px]">
              {language === "sw" ? category.swLabel : category.label}
              <ArrowUpRight className="hidden h-3 w-3 opacity-0 transition group-hover:opacity-100 sm:block" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
