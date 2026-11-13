import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  variant = "dark",
  className,
  showWordmark = true
}: {
  variant?: "dark" | "light";
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="TRENDORA home"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-[11px] shadow-sm",
          variant === "light" ? "bg-white" : "bg-brand-700"
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none">
          <path
            d="M8 8h16v4.5h-5.6V24h-4.8V12.5H8V8Z"
            fill={variant === "light" ? "#0E5F6D" : "#FFFFFF"}
          />
          <circle cx="23.5" cy="22.5" r="2.5" fill="#F6DAD5" />
        </svg>
      </span>
      {showWordmark && (
        <span
          className={cn(
            "font-display text-[1.15rem] font-extrabold tracking-[0.22em]",
            variant === "light" ? "text-white" : "text-ink"
          )}
        >
          TRENDORA
        </span>
      )}
    </Link>
  );
}
