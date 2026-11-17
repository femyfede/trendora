"use client";

import { LANGUAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useStore } from "./store-context";

/** A visible SW | EN toggle. Kiswahili is the default. */
export function LanguageSwitch({
  variant = "light",
  className
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const { language, setLanguage, tr } = useStore();
  const dark = variant === "dark";

  return (
    <div
      role="group"
      aria-label={tr("Language", "Lugha")}
      className={cn(
        "inline-flex items-center rounded-full p-0.5 text-xs font-bold",
        dark ? "bg-white/10" : "bg-zinc-100",
        className
      )}
    >
      {LANGUAGES.map((item) => {
        const active = language === item.value;
        return (
          <button
            key={item.value}
            type="button"
            lang={item.value}
            onClick={() => !active && setLanguage(item.value)}
            aria-pressed={active}
            title={item.label}
            className={cn(
              "min-w-[38px] rounded-full px-2.5 py-1.5 transition",
              active
                ? dark
                  ? "bg-white text-ink"
                  : "bg-white text-ink shadow-sm"
                : dark
                  ? "text-white/70 hover:text-white"
                  : "text-zinc-500 hover:text-ink"
            )}
          >
            {item.short}
          </button>
        );
      })}
    </div>
  );
}
