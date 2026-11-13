import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  rating,
  reviewCount,
  className,
  compact = false
}: {
  rating: number;
  reviewCount?: number;
  className?: string;
  compact?: boolean;
}) {
  const rounded = Math.round(rating);
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div
        className="flex items-center gap-0.5 text-amber-400"
        aria-label={`${rating.toFixed(1)} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              compact ? "h-3 w-3" : "h-3.5 w-3.5",
              star <= rounded ? "fill-current" : "fill-zinc-200 text-zinc-200"
            )}
            strokeWidth={0}
            aria-hidden="true"
          />
        ))}
      </div>
      <span
        className={cn(
          "text-zinc-500",
          compact ? "text-[10px] sm:text-[11px]" : "text-xs"
        )}
      >
        ({reviewCount ?? 0})
      </span>
    </div>
  );
}
