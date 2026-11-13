"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantitySelector({
  value,
  onChange,
  max = 99,
  min = 1,
  small = false,
  disabled = false
}: {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  small?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-zinc-200 bg-white",
        small ? "h-9" : "h-12"
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        className={cn(
          "grid place-items-center text-zinc-600 transition hover:text-ink disabled:opacity-30",
          small ? "h-9 w-9" : "h-12 w-11"
        )}
        aria-label="Decrease quantity"
      >
        <Minus className={small ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>
      <span
        className={cn(
          "text-center font-semibold tabular-nums",
          small ? "w-7 text-xs" : "w-8 text-sm"
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className={cn(
          "grid place-items-center text-zinc-600 transition hover:text-ink disabled:opacity-30",
          small ? "h-9 w-9" : "h-12 w-11"
        )}
        aria-label="Increase quantity"
      >
        <Plus className={small ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>
    </div>
  );
}
