"use client";

import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { useStore } from "./store-context";

export function Categories() {
  const { t, language } = useStore();

  return (
    <section className="container-shell py-12 sm:py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="section-kicker">{t("sections.categories.kicker")}</p>
          <h2 className="section-title mt-2">{t("sections.categories.title")}</h2>
        </div>
        <Link href="/shop" className="hidden text-sm font-semibold text-brand-700 hover:underline sm:block">
          {t("common.viewAll")} →
        </Link>
      </div>

      <ul className="mt-8 grid grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-5 lg:grid-cols-8">
        {CATEGORIES.map((category) => {
          const label = language === "sw" ? category.swLabel : category.label;
          return (
            <li key={category.value}>
              <Link
                href={`/shop?category=${encodeURIComponent(category.value)}`}
                className="group flex flex-col items-center text-center"
              >
                <span className="relative block aspect-square w-full max-w-[120px] overflow-hidden rounded-2xl bg-smoke ring-1 ring-zinc-200 transition group-hover:ring-2 group-hover:ring-brand-600">
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 22vw, 120px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </span>
                <span className="mt-2.5 text-xs font-semibold leading-tight text-ink transition group-hover:text-brand-700 sm:text-sm">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
