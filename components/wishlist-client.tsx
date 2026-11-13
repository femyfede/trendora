"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Loader2, Trash2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/components/store-context";
import { ProductCard } from "@/components/product-card";

export function WishlistClient() {
  const {
    wishlist,
    hydrated,
    removeFromWishlist,
    format,
    language
  } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((response) => response.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (!hydrated) {
    return (
      <div className="container-shell py-16">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
          <div className="h-64 animate-pulse rounded-2xl bg-zinc-100" />
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container-shell flex flex-col items-center py-20 text-center sm:py-28">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-[#FBEAEC] text-[#D95670]">
          <Heart className="h-9 w-9" strokeWidth={1.4} />
        </span>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">
          {language === "sw" ? "Orodha yako ni tupu" : "Your wishlist is empty"}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-zinc-500">
          {language === "sw"
            ? "Gusa mioyo kwenye bidhaa unazopenda ili kuzihifadhi hapa."
            : "Tap the heart on pieces you love and they will be saved here."}
        </p>
        <Link href="/shop" className="btn-primary mt-7">
          {language === "sw" ? "Gundua bidhaa" : "Discover pieces"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const found = products.filter((product) =>
    wishlist.some((item) => item.productId === product.id)
  );
  const missing = wishlist.filter(
    (item) => !products.some((product) => product.id === item.productId)
  );

  return (
    <div className="container-shell py-8 sm:py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Saved for later</p>
          <h1 className="mt-1.5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {language === "sw" ? "Orodha ya Kupenda" : "Your Wishlist"}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            {wishlist.length} {wishlist.length === 1 ? "piece" : "pieces"} saved
          </p>
        </div>
        <Link href="/shop" className="link-underline">
          Continue shopping
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin text-brand-700" />
          Loading saved pieces…
        </div>
      ) : (
        <>
          {found.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {found.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 2}
                />
              ))}
            </div>
          )}

          {missing.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xs font-semibold text-zinc-500">
                No longer available
              </h2>
              <div className="mt-3 divide-y divide-zinc-100 rounded-2xl border border-zinc-200">
                {missing.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 p-3.5">
                    <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-smoke">
                      <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover opacity-60" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-zinc-500">{item.name}</p>
                      <p className="mt-0.5 text-[10px] text-zinc-400">
                        {format(item.price)} · Currently unavailable
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.productId)}
                      className="rounded-full p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                      aria-label={`Remove ${item.name} from wishlist`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
