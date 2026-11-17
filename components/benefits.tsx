"use client";

import { Banknote, Headphones, RotateCcw, Truck } from "lucide-react";
import { useStore } from "./store-context";

export function Benefits() {
  const { t } = useStore();
  const items = [
    { icon: Truck, title: "benefits.freeTitle", sub: "benefits.freeSub" },
    { icon: Banknote, title: "benefits.secureTitle", sub: "benefits.secureSub" },
    { icon: RotateCcw, title: "benefits.returnsTitle", sub: "benefits.returnsSub" },
    { icon: Headphones, title: "benefits.supportTitle", sub: "benefits.supportSub" }
  ] as const;

  return (
    <section className="border-b border-zinc-200/80 bg-sand">
      <ul className="container-shell grid grid-cols-2 gap-x-4 gap-y-6 py-7 sm:py-9 lg:grid-cols-4 lg:gap-0">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.title}
              className="flex items-start gap-3 lg:justify-center lg:border-l lg:border-zinc-200 lg:px-6 lg:first:border-l-0"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-brand-700 shadow-sm">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-ink">{t(item.title)}</h2>
                <p className="mt-0.5 text-[13px] leading-snug text-zinc-600">{t(item.sub)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
