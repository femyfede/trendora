"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Heart,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  X,
  Check
} from "lucide-react";
import type { Product } from "@/lib/types";
import {
  cn,
  discountPercent,
  stockLabel,
  stockTone
} from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { useStore } from "@/components/store-context";
import { Rating } from "@/components/rating";
import { QuantitySelector } from "@/components/quantity-selector";
import { ProductCard } from "@/components/product-card";

const TABS = ["description", "material", "shipping"] as const;
type Tab = (typeof TABS)[number];

export function ProductDetail({
  product,
  related
}: {
  product: Product;
  related: Product[];
}) {
  const router = useRouter();
  const {
    format,
    addToCart,
    toggleWishlist,
    isWishlisted,
    language
  } = useStore();

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : "");
  const [color, setColor] = useState(
    product.colors.length === 1 ? product.colors[0].name : ""
  );
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("description");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const soldOut = product.stock <= 0;
  const wishlisted = isWishlisted(product.id);
  const percent = discountPercent(product);

  const validate = () => {
    if (soldOut) return false;
    if (!size) {
      setError(language === "sw" ? "Tafadhali chagua ukubwa." : "Please select a size.");
      return false;
    }
    if (!color) {
      setError(language === "sw" ? "Tafadhali chagua rangi." : "Please select a colour.");
      return false;
    }
    setError("");
    return true;
  };

  const handleAdd = () => {
    if (!validate()) return;
    addToCart({ product, size, color, qty });
  };

  const handleBuyNow = () => {
    if (!validate()) return;
    addToCart({ product, size, color, qty });
    router.push("/checkout");
  };

  return (
    <div>
      <div className="container-shell py-5">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500"
        >
          <Link href="/" className="transition hover:text-brand-700">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="transition hover:text-brand-700">
            Shop
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/shop?category=${encodeURIComponent(product.category)}`}
            className="transition hover:text-brand-700"
          >
            {product.category}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-ink">{product.name}</span>
        </nav>
      </div>

      <div className="container-shell grid gap-8 pb-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-smoke">
            <Image
              src={product.images[activeImage] || product.images[0]}
              alt={`${product.name} — view ${activeImage + 1}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1.5">
              {percent > 0 && (
                <span className="rounded-full bg-[#D95670] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Save {percent}%
                </span>
              )}
              {product.isBestSeller && (
                <span className="rounded-full bg-brand-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Best Seller
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-pressed={wishlisted}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-ink shadow-sm transition hover:scale-105"
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  wishlisted && "fill-[#D95670] text-[#D95670]"
                )}
              />
            </button>
          </div>

          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2.5">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={cn(
                    "relative aspect-[4/5] w-20 overflow-hidden rounded-xl border-2 bg-smoke transition",
                    activeImage === index
                      ? "border-brand-700"
                      : "border-transparent hover:border-zinc-300"
                  )}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={activeImage === index}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
            {product.brand} · {product.category}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Rating rating={product.rating} reviewCount={product.reviewCount} />
            <span
              className={cn(
                "flex items-center gap-1.5 text-[11px] font-medium",
                stockTone(product.stock)
              )}
            >
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
              {stockLabel(product.stock, language)}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-2xl font-extrabold text-ink">
              {format(product.price)}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-sm text-zinc-400 line-through">
                  {format(product.compareAtPrice)}
                </span>
                <span className="rounded-full bg-[#FBEAEC] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#B83B56]">
                  Save {format(product.compareAtPrice - product.price)}
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">
            Price includes VAT. Displayed in {format(product.price).split(" ")[0]}.
          </p>

          <p className="mt-5 text-sm leading-relaxed text-zinc-600">
            {product.description}
          </p>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-ink">
                {language === "sw" ? "Ukubwa" : "Size"}{" "}
                {size && <span className="font-normal text-brand-700">· {size}</span>}
              </p>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="text-[11px] font-semibold text-zinc-500 underline underline-offset-2 hover:text-brand-700"
              >
                {language === "sw" ? "Mwongozo wa ukubwa" : "Size guide"}
              </button>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {product.sizes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSize(item);
                    setError("");
                  }}
                  className={cn(
                    "min-w-[48px] rounded-lg border px-3.5 py-2.5 text-xs font-semibold transition",
                    size === item
                      ? "border-ink bg-ink text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-ink"
                  )}
                  aria-pressed={size === item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold text-ink">
              {language === "sw" ? "Rangi" : "Colour"}{" "}
              {color && <span className="font-normal text-brand-700">· {color}</span>}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {product.colors.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    setColor(item.name);
                    setError("");
                  }}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full border-2 transition",
                    color === item.name
                      ? "border-ink"
                      : "border-transparent hover:border-zinc-300"
                  )}
                  aria-label={item.name}
                  aria-pressed={color === item.name}
                  title={item.name}
                >
                  <span
                    className="h-7 w-7 rounded-full border border-black/5"
                    style={{ backgroundColor: item.hex }}
                  >
                    {color === item.name && (
                      <Check
                        className={cn(
                          "m-auto h-4 w-4",
                          ["Ivory", "Sand", "Gold"].includes(item.name)
                            ? "text-ink"
                            : "text-white"
                        )}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <QuantitySelector
              value={qty}
              onChange={setQty}
              max={Math.max(1, product.stock)}
              disabled={soldOut}
            />
            <span className="text-[11px] text-zinc-400">
              {soldOut
                ? language === "sw"
                  ? "Bidhaa hii imeisha"
                  : "This piece is currently sold out"
                : language === "sw"
                  ? "Tuma ndani ya siku 1–2 Dar es Salaam"
                  : "Ships in 1–2 days in Dar es Salaam"}
            </span>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={handleAdd}
              disabled={soldOut}
              className="btn-primary flex-1"
            >
              <ShoppingBag className="h-4 w-4" />
              {soldOut
                ? language === "sw"
                  ? "Imeisha"
                  : "Sold out"
                : language === "sw"
                  ? "Ongeza kwenye Kikapu"
                  : "Add to Cart"}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={soldOut}
              className="btn-dark flex-1"
            >
              {language === "sw" ? "Nunua Sasa" : "Buy Now"}
            </button>
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-zinc-200 bg-[#FAFBFB] p-4 sm:grid-cols-3">
            <div className="flex items-start gap-2.5">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
              <div>
                <p className="text-[11px] font-semibold text-ink">Delivery</p>
                <p className="text-[10px] leading-snug text-zinc-500">
                  Free over TZS 150,000
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
              <div>
                <p className="text-[11px] font-semibold text-ink">Easy returns</p>
                <p className="text-[10px] leading-snug text-zinc-500">
                  14 days, unworn
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
              <div>
                <p className="text-[11px] font-semibold text-ink">Secure</p>
                <p className="text-[10px] leading-snug text-zinc-500">
                  Safe checkout
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-zinc-200 pt-5">
            <div
              role="tablist"
              aria-label="Product information"
              className="flex flex-wrap gap-5 border-b border-zinc-100"
            >
              {TABS.map((item) => (
                <button
                  key={item}
                  role="tab"
                  id={`tab-${item}`}
                  aria-selected={tab === item}
                  aria-controls={`panel-${item}`}
                  onClick={() => setTab(item)}
                  className={cn(
                    "relative pb-3 text-xs font-semibold capitalize transition",
                    tab === item
                      ? "text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand-700"
                      : "text-zinc-400 hover:text-zinc-700"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="pt-4 text-sm leading-relaxed text-zinc-600">
              {tab === "description" && (
                <div id="panel-description" role="tabpanel" aria-labelledby="tab-description">
                  <p>{product.description}</p>
                  <ul className="mt-3 space-y-1.5 text-xs">
                    {product.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-600" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tab === "material" && (
                <div id="panel-material" role="tabpanel" aria-labelledby="tab-material">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Material
                  </p>
                  <p className="mt-1 text-sm">{product.material}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Care
                  </p>
                  <p className="mt-1 text-sm">
                    Machine wash cold with similar colours. Do not bleach. Warm iron
                    on reverse. Dry flat in shade to keep the shape and colour.
                  </p>
                </div>
              )}

              {tab === "shipping" && (
                <div id="panel-shipping" role="tabpanel" aria-labelledby="tab-shipping" className="space-y-3 text-sm">
                  <p>
                    We deliver across Tanzania from our studio in Dar es Salaam.
                    Orders placed before 14:00 EAT are usually packed the same day.
                  </p>
                  <ul className="space-y-2 text-xs">
                    <li className="flex justify-between gap-4 border-b border-zinc-100 pb-2">
                      <span>Dar es Salaam</span>
                      <span className="font-medium text-ink">1 – 2 days · TZS 7,000</span>
                    </li>
                    <li className="flex justify-between gap-4 border-b border-zinc-100 pb-2">
                      <span>Arusha, Dodoma, Morogoro</span>
                      <span className="font-medium text-ink">2 – 4 days · from TZS 9,000</span>
                    </li>
                    <li className="flex justify-between gap-4 border-b border-zinc-100 pb-2">
                      <span>Mwanza, Mbeya, Zanzibar</span>
                      <span className="font-medium text-ink">2 – 5 days · from TZS 12,000</span>
                    </li>
                    <li className="flex justify-between gap-4">
                      <span>Other Tanzanian regions</span>
                      <span className="font-medium text-ink">3 – 6 days · TZS 15,000</span>
                    </li>
                  </ul>
                  <p className="text-xs">
                    Free delivery on orders over TZS 150,000. Returns are accepted
                    within 14 days of delivery, unworn and with tags attached. Read our{" "}
                    <Link href="/returns" className="font-semibold text-brand-700 underline">
                      returns policy
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>
          </div>

          <p className="mt-6 text-[11px] text-zinc-400">
            Questions? Call{" "}
            <a href={`tel:${SITE.phoneHref}`} className="font-semibold text-brand-700">
              {SITE.phone}
            </a>{" "}
            or{" "}
            <Link href="/contact" className="font-semibold text-brand-700 underline">
              message our team
            </Link>
            .
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-zinc-200/70 bg-[#F7F8F7]">
          <div className="container-shell py-14 lg:py-16">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="section-kicker">Complete the look</p>
                <h2 className="section-title mt-1.5">You may also like</h2>
              </div>
              <Link
                href={`/shop?category=${encodeURIComponent(product.category)}`}
                className="hidden text-xs font-semibold text-brand-700 hover:underline sm:block"
              >
                View all {product.category.toLowerCase()}
              </Link>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {sizeGuideOpen && (
        <div
          className="fixed inset-0 z-[115] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Size guide"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSizeGuideOpen(false);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lift animate-fade-up">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-extrabold">Size guide</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Measurements are in centimetres. Between sizes? Size up for a
                  relaxed fit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-ink"
                aria-label="Close size guide"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-smoke text-[10px] uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Size</th>
                    <th className="px-3 py-2.5 font-semibold">Bust</th>
                    <th className="px-3 py-2.5 font-semibold">Waist</th>
                    <th className="px-3 py-2.5 font-semibold">Hip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {[
                    ["XS", "80 – 84", "62 – 66", "88 – 92"],
                    ["S", "85 – 89", "67 – 71", "93 – 97"],
                    ["M", "90 – 94", "72 – 76", "98 – 102"],
                    ["L", "95 – 100", "77 – 82", "103 – 108"],
                    ["XL", "101 – 106", "83 – 88", "109 – 114"],
                    ["XXL", "107 – 112", "89 – 94", "115 – 120"]
                  ].map((row) => (
                    <tr key={row[0]}>
                      <td className="px-3 py-2.5 font-semibold text-ink">{row[0]}</td>
                      <td className="px-3 py-2.5 text-zinc-600">{row[1]}</td>
                      <td className="px-3 py-2.5 text-zinc-600">{row[2]}</td>
                      <td className="px-3 py-2.5 text-zinc-600">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">
              Shoe sizes use EU sizing. Accessories are one size. Still unsure?
              Contact us on {SITE.phone} and our team will help you choose.
            </p>
            <button
              type="button"
              onClick={() => setSizeGuideOpen(false)}
              className="btn-primary mt-5 w-full"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
