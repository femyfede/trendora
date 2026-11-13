"use client";

import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useStore } from "./store-context";

export function Benefits() {
  const { t } = useStore();
  const items = [
    { icon: Truck, title: "benefits.freeTitle", sub: "benefits.freeSub" },
    { icon: ShieldCheck, title: "benefits.secureTitle", sub: "benefits.secureSub" },
    { icon: RotateCcw, title: "benefits.returnsTitle", sub: "benefits.returnsSub" },
    { icon: Headphones, title: "benefits.supportTitle", sub: "benefits.supportSub" }
  ] as const;

  return (
    <section className="border-b border-zinc-200/80 bg-white">
      <div className="container-shell grid grid-cols-2 gap-x-4 gap-y-7 py-8 sm:py-10 lg:grid-cols-4 lg:gap-0">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex items-start gap-3 lg:justify-center lg:border-l lg:border-zinc-200 lg:px-6 lg:first:border-l-0"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <div>
                <h2 className="font-display text-[13px] font-bold text-ink sm:text-sm">
                  {t(item.title)}
                </h2>
                <p className="mt-0.5 text-[11px] leading-snug text-zinc-500 sm:text-xs">
                  {t(item.sub)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
