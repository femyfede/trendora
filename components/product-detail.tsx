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
import { SITE, categoryLabel } from "@/lib/constants";
import { useStore } from "@/components/store-context";
import { Rating } from "@/components/rating";
import { QuantitySelector } from "@/components/quantity-selector";
import { ProductCard } from "@/components/product-card";

const TABS = ["description", "material", "shipping"] as const;
const TAB_LABELS: Record<(typeof TABS)[number], { en: string; sw: string }> = {
  description: { en: "Description", sw: "Maelezo" },
  material: { en: "Material & care", sw: "Kitambaa na utunzaji" },
  shipping: { en: "Delivery & returns", sw: "Usafirishaji na kurudisha" }
};
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
    language,
    tr
  } = useStore();
  const category = categoryLabel(product.category, language);

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
      setError(tr("Please choose a size.", "Tafadhali chagua saizi."));
      return false;
    }
    if (!color) {
      setError(tr("Please choose a colour.", "Tafadhali chagua rangi."));
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
          aria-label={tr("Breadcrumb", "Ulipo")}
          className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500"
        >
          <Link href="/" className="transition hover:text-brand-700">
            {tr("Home", "Mwanzo")}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="transition hover:text-brand-700">
            {tr("Products", "Bidhaa")}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/shop?category=${encodeURIComponent(product.category)}`}
            className="transition hover:text-brand-700"
          >
            {category}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-ink" aria-current="page">{product.name}</span>
        </nav>
      </div>

      <div className="container-shell grid gap-8 pb-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-smoke">
            <Image
              src={product.images[activeImage] || product.images[0]}
              alt={`${product.name} (${activeImage + 1}/${product.images.length})`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1.5">
              {percent > 0 && (
                <span className="rounded-full bg-clay-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {tr(`Save ${percent}%`, `Punguzo ${percent}%`)}
                </span>
              )}
              {product.isBestSeller && (
                <span className="rounded-full bg-brand-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {tr("Best seller", "Inauzika")}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-pressed={wishlisted}
              aria-label={wishlisted ? tr("Remove from saved items", "Ondoa kwenye ulivyopenda") : tr("Save item", "Hifadhi bidhaa")}
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-ink shadow-sm transition hover:scale-105"
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  wishlisted && "fill-clay-500 text-clay-500"
                )}
              />
            </button>
          </div>

          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2.5 overflow-x-auto no-scrollbar">
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
                  aria-label={tr(`Show image ${index + 1}`, `Onyesha picha ya ${index + 1}`)}
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
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-clay-600">
            {product.brand} · {category}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            {product.reviewCount > 0 && (
              <a href="#reviews" className="hover:opacity-80">
                <Rating rating={product.rating} reviewCount={product.reviewCount} />
              </a>
            )}
            <span
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
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
                <span className="rounded-full bg-clay-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-clay-700">
                  {tr("You save", "Unaokoa")} {format(product.compareAtPrice - product.price)}
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {tr("Pay in cash when your order arrives.", "Lipa pesa taslimu mzigo ukifika.")}
          </p>

          <p className="mt-5 text-base leading-relaxed text-zinc-700">
            {product.description}
          </p>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">
                {tr("Size", "Saizi")}{" "}
                {size && <span className="font-normal text-brand-700">· {size}</span>}
              </p>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="py-2 text-sm font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                {tr("Size guide", "Mwongozo wa saizi")}
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
                    "min-h-[46px] min-w-[52px] rounded-lg border px-3.5 py-2.5 text-sm font-semibold transition",
                    size === item
                      ? "border-ink bg-ink text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-ink"
                  )}
                  aria-pressed={size === item}
                >
                  {item === "One Size" ? tr("One size", "Saizi moja") : item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-ink">
              {tr("Colour", "Rangi")}{" "}
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
                    "grid h-11 w-11 place-items-center rounded-full border-2 transition",
                    color === item.name
                      ? "border-ink"
                      : "border-transparent hover:border-zinc-300"
                  )}
                  aria-label={item.name}
                  aria-pressed={color === item.name}
                  title={item.name}
                >
                  <span
                    className="grid h-8 w-8 place-items-center rounded-full border border-black/5"
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
            <span className="text-sm text-zinc-600">
              {soldOut
                ? tr("This item is sold out", "Bidhaa hii imeisha")
                : tr("Arrives in 1–2 days in Dar es Salaam", "Inafika ndani ya siku 1–2 Dar es Salaam")}
            </span>
          </div>

          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
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
              {soldOut ? tr("Sold out", "Imeisha") : tr("Add to cart", "Weka kwenye kikapu")}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={soldOut}
              className="btn-dark flex-1"
            >
              {tr("Buy now", "Nunua sasa")}
            </button>
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-zinc-200 bg-sand p-4 sm:grid-cols-3">
            {[
              { icon: Truck, title: tr("Delivery", "Usafirishaji"), body: tr("Free over TZS 150,000", "Bure zaidi ya TZS 150,000") },
              { icon: RotateCcw, title: tr("Easy returns", "Kurudisha ni rahisi"), body: tr("Within 14 days, unworn", "Ndani ya siku 14, bila kuvaliwa") },
              { icon: ShieldCheck, title: tr("Pay on delivery", "Lipa ukipokea"), body: tr("Check first, then pay", "Kagua kwanza, kisha ulipe") }
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-2.5">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
                <div>
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="text-xs leading-snug text-zinc-600">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-zinc-200 pt-5">
            <div
              role="tablist"
              aria-label={tr("Product information", "Taarifa za bidhaa")}
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
                    "relative pb-3 text-sm font-semibold transition",
                    tab === item
                      ? "text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand-700"
                      : "text-zinc-400 hover:text-zinc-700"
                  )}
                >
                  {tr(TAB_LABELS[item].en, TAB_LABELS[item].sw)}
                </button>
              ))}
            </div>

            <div className="pt-4 text-sm leading-relaxed text-zinc-700">
              {tab === "description" && (
                <div id="panel-description" role="tabpanel" aria-labelledby="tab-description">
                  <p>{product.description}</p>
                  <ul className="mt-3 space-y-1.5 text-sm">
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
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {tr("Material", "Kitambaa")}
                  </p>
                  <p className="mt-1 text-sm">{product.material}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    {tr("Care", "Utunzaji")}
                  </p>
                  <p className="mt-1 text-sm">
                    {tr(
                      "Wash in cold water with similar colours. Do not bleach. Iron on the reverse side. Dry in the shade to keep the colour.",
                      "Fua kwa maji ya baridi pamoja na rangi zinazofanana. Usitumie jiki (bleach). Piga pasi upande wa ndani. Anika kivulini ili rangi isififie."
                    )}
                  </p>
                </div>
              )}

              {tab === "shipping" && (
                <div id="panel-shipping" role="tabpanel" aria-labelledby="tab-shipping" className="space-y-3 text-sm">
                  <p>
                    {tr(
                      "We deliver to every region of Tanzania from Dar es Salaam. Orders placed before 2 pm are usually packed the same day.",
                      "Tunafikisha mikoa yote ya Tanzania kutoka Dar es Salaam. Oda zinazowekwa kabla ya saa 8 mchana hufungwa siku hiyo hiyo."
                    )}
                  </p>
                  <ul className="space-y-2 text-sm">
                    {[
                      ["Dar es Salaam", tr("1 – 2 days · TZS 7,000", "siku 1 – 2 · TZS 7,000")],
                      ["Morogoro, Arusha, Dodoma, Tanga", tr("2 – 4 days · from TZS 9,000", "siku 2 – 4 · kuanzia TZS 9,000")],
                      [tr("Mwanza, Mbeya, Zanzibar", "Mwanza, Mbeya, Zanzibar"), tr("2 – 5 days · from TZS 12,000", "siku 2 – 5 · kuanzia TZS 12,000")],
                      [tr("Other regions", "Mikoa mingine"), tr("3 – 6 days · TZS 15,000", "siku 3 – 6 · TZS 15,000")]
                    ].map(([place, info]) => (
                      <li key={place} className="flex justify-between gap-4 border-b border-zinc-100 pb-2 last:border-0">
                        <span>{place}</span>
                        <span className="text-right font-medium text-ink">{info}</span>
                      </li>
                    ))}
                  </ul>
                  <p>
                    {tr(
                      "Free delivery on orders over TZS 150,000. You can return unworn items with their tags within 14 days.",
                      "Usafirishaji ni bure kwa oda ya zaidi ya TZS 150,000. Unaweza kurudisha bidhaa ambayo haijavaliwa ikiwa na lebo zake ndani ya siku 14."
                    )}{" "}
                    <Link href="/returns" className="font-semibold text-brand-700 underline">
                      {tr("Read the returns policy", "Soma sera ya kurudisha")}
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>

          <p className="mt-6 text-sm text-zinc-600">
            {tr("Questions? Call", "Una swali? Piga")}{" "}
            <a href={`tel:${SITE.phoneHref}`} className="font-semibold text-brand-700">
              {SITE.phone}
            </a>{" "}
            {tr("or", "au")}{" "}
            <Link href="/contact" className="font-semibold text-brand-700 underline">
              {tr("send us a message", "tutumie ujumbe")}
            </Link>
            .
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-zinc-200/70 bg-sand">
          <div className="container-shell py-14 lg:py-16">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="section-kicker">{tr("Complete the look", "Kamilisha mtindo")}</p>
                <h2 className="section-title mt-1.5">{tr("You may also like", "Unaweza pia kupenda")}</h2>
              </div>
              <Link
                href={`/shop?category=${encodeURIComponent(product.category)}`}
                className="hidden text-sm font-semibold text-brand-700 hover:underline sm:block"
              >
                {tr("View all", "Tazama zote")} →
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
          aria-label={tr("Size guide", "Mwongozo wa saizi")}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSizeGuideOpen(false);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lift animate-fade-up">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-extrabold">{tr("Size guide", "Mwongozo wa saizi")}</h2>
                <p className="mt-1 text-sm text-zinc-600">
                  {tr(
                    "Measurements are in centimetres. Between two sizes? Choose the bigger one for a relaxed fit.",
                    "Vipimo viko kwa sentimita. Uko kati ya saizi mbili? Chagua kubwa zaidi ili ikae kwa nafasi."
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-ink"
                aria-label={tr("Close", "Funga")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-smoke text-[10px] uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">{tr("Size", "Saizi")}</th>
                    <th className="px-3 py-2.5 font-semibold">{tr("Bust", "Kifua")}</th>
                    <th className="px-3 py-2.5 font-semibold">{tr("Waist", "Kiuno")}</th>
                    <th className="px-3 py-2.5 font-semibold">{tr("Hip", "Nyonga")}</th>
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
            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              {tr(
                `Shoes use EU sizes. Accessories are one size. Still unsure? Call ${SITE.phone} and we will help you choose.`,
                `Viatu vinatumia saizi za Ulaya (EU). Mapambo ni saizi moja. Bado huna uhakika? Piga ${SITE.phone} tukusaidie kuchagua.`
              )}
            </p>
            <button
              type="button"
              onClick={() => setSizeGuideOpen(false)}
              className="btn-primary mt-5 w-full"
            >
              {tr("Got it", "Sawa, nimeelewa")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
