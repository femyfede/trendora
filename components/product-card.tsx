"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { cn, discountPercent, stockLabel, stockTone } from "@/lib/utils";
import { useStore } from "./store-context";
import { Rating } from "./rating";
import { QuickAddModal } from "./quick-add-modal";
import { useState } from "react";

export function ProductCard({
  product,
  priority = false,
  className
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const { format, toggleWishlist, isWishlisted, language } = useStore();
  const [quickOpen, setQuickOpen] = useState(false);
  const percent = discountPercent(product);
  const wishlisted = isWishlisted(product.id);
  const soldOut = product.stock <= 0;

  return (
    <>
      <article
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-card",
          className
        )}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-[#F1F3F3]">
          <Link
            href={`/product/${product.slug}`}
            className="absolute inset-0"
            aria-label={`View ${product.name}`}
          >
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            />
            {soldOut && (
              <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px]" />
            )}
          </Link>

          <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {percent > 0 && (
              <span className="rounded-full bg-[#D95670] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                -{percent}%
              </span>
            )}
            {product.isNew && (
              <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink shadow-sm">
                New
              </span>
            )}
            {product.isBestSeller && (
              <span className="rounded-full bg-brand-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                Best Seller
              </span>
            )}
            {soldOut && (
              <span className="rounded-full bg-ink/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                {language === "sw" ? "Imeisha" : "Sold out"}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            aria-label={
              wishlisted
                ? `Remove ${product.name} from wishlist`
                : `Add ${product.name} to wishlist`
            }
            aria-pressed={wishlisted}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink shadow-sm transition hover:scale-105 hover:bg-white"
          >
            <Heart
              className={cn(
                "h-[17px] w-[17px]",
                wishlisted && "fill-[#D95670] text-[#D95670]"
              )}
            />
          </button>

          <button
            type="button"
            onClick={() => setQuickOpen(true)}
            disabled={soldOut}
            aria-label={`Quick add ${product.name} to cart`}
            className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-brand-700 text-white shadow-lg shadow-brand-900/25 transition hover:scale-105 hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:shadow-none"
          >
            <ShoppingBag className="h-[17px] w-[17px]" />
          </button>
        </div>

        <div className="flex flex-1 flex-col p-3.5 sm:p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            {product.brand}
          </p>
          <Link
            href={`/product/${product.slug}`}
            className="mt-1 line-clamp-2-safe font-display text-[13px] font-bold leading-snug text-ink transition hover:text-brand-700 sm:text-[15px]"
          >
            {product.name}
          </Link>

          <Rating
            rating={product.rating}
            reviewCount={product.reviewCount}
            compact
            className="mt-1.5"
          />

          <div className="mt-2 flex items-end justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-[15px] font-bold text-ink sm:text-base">
                {format(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-zinc-400 line-through">
                  {format(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                soldOut
                  ? "bg-zinc-300"
                  : product.stock <= 5
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium sm:text-[11px]",
                stockTone(product.stock)
              )}
            >
              {stockLabel(product.stock, language)}
            </span>
          </div>
        </div>
      </article>

      <QuickAddModal
        product={product}
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
      />
    </>
  );
}
