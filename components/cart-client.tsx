"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  Lock,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X
} from "lucide-react";
import { useStore } from "@/components/store-context";
import { QuantitySelector } from "@/components/quantity-selector";
import {
  cn,
  formatPrice,
  isFreeShipping,
  shippingProgress
} from "@/lib/utils";
import { CATEGORIES, FREE_SHIPPING_THRESHOLD, REGIONS } from "@/lib/constants";

export function CartClient() {
  const {
    cart,
    hydrated,
    currency,
    format,
    updateQty,
    removeFromCart,
    clearCart,
    discount,
    applyDiscount,
    cartSubtotal,
    t,
    tr,
    language,
    toast
  } = useStore();

  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [codeError, setCodeError] = useState("");

  if (!hydrated) {
    return (
      <div className="container-shell py-16">
        <div className="mx-auto max-w-md space-y-4">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-100" />
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-100" />
        </div>
      </div>
    );
  }

  const discountAmount = discount
    ? Math.round((cartSubtotal * discount.percent) / 100)
    : 0;
  const afterDiscount = Math.max(0, cartSubtotal - discountAmount);
  const freeShip =
    isFreeShipping(afterDiscount) || Boolean(discount?.freeShipping);
  // Cheapest regional fee (Dar es Salaam); the exact fee is calculated at checkout.
  const estimatedShipping = freeShip ? 0 : Math.min(...REGIONS.map((region) => region.fee));
  const total = afterDiscount + estimatedShipping;

  const applyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setCodeError(tr("Enter a discount code.", "Weka kuponi ya punguzo."));
      return;
    }
    setApplying(true);
    setCodeError("");
    try {
      const response = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalized })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || tr("That code is not valid.", "Kuponi hiyo si sahihi."));
      applyDiscount({
        code: data.code,
        percent: data.percent,
        freeShipping: data.freeShipping,
        active: true,
        description: data.description
      });
      setCode("");
      toast(tr(`Code ${data.code} applied`, `Kuponi ${data.code} imetumika`));
    } catch (error) {
      setCodeError(
        error instanceof TypeError ? t("common.network") : error instanceof Error ? error.message : t("common.error")
      );
    } finally {
      setApplying(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container-shell flex flex-col items-center py-16 text-center sm:py-24">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-brand-50 text-brand-700">
          <ShoppingBag className="h-9 w-9" strokeWidth={1.4} />
        </span>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">
          {t("cart.empty")}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-zinc-500">{t("cart.emptySub")}</p>
        <Link href="/shop" className="btn-primary mt-7">
          {t("cart.continue")}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {CATEGORIES.slice(0, 6).map((item) => (
            <Link
              key={item.value}
              href={`/shop?category=${encodeURIComponent(item.value)}`}
              className="chip px-4 py-2 text-sm"
            >
              {language === "sw" ? item.swLabel : item.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-shell py-8 sm:py-10 lg:py-14">
      <nav aria-label={tr("Breadcrumb", "Ulipo")} className="text-xs text-zinc-500">
        <Link href="/" className="hover:text-brand-700">
          {tr("Home", "Mwanzo")}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">{t("nav.cart")}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("cart.title")}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-600">
            {tr(
              `${cart.reduce((sum, item) => sum + item.qty, 0)} items`,
              `Bidhaa ${cart.reduce((sum, item) => sum + item.qty, 0)}`
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(tr("Remove everything from your cart?", "Ondoa bidhaa zote kwenye kikapu?"))) clearCart();
          }}
          className="px-1 py-2 text-sm font-medium text-zinc-500 underline-offset-2 transition hover:text-red-600 hover:underline"
        >
          {tr("Empty cart", "Ondoa zote")}
        </button>
      </div>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
        <div>
          <div className="rounded-2xl border border-zinc-200 bg-white">
            <div className="hidden grid-cols-[1fr_130px_110px] gap-4 border-b border-zinc-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 sm:grid">
              <span>{tr("Product", "Bidhaa")}</span>
              <span className="text-center">{t("cart.quantity")}</span>
              <span className="text-right">{t("cart.total")}</span>
            </div>
            <div className="divide-y divide-zinc-100">
              {cart.map((item) => (
                <div
                  key={item.lineId}
                  className="grid gap-3 p-3.5 sm:grid-cols-[1fr_130px_110px] sm:items-center sm:gap-4 sm:p-5"
                >
                  <div className="flex gap-3.5">
                    <Link
                      href={`/product/${item.slug}`}
                      className="relative h-[104px] w-[82px] shrink-0 overflow-hidden rounded-lg bg-smoke sm:h-[112px] sm:w-[88px]"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="90px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-display text-sm font-bold text-ink transition hover:text-brand-700"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-zinc-600">
                        {tr("Size", "Saizi")}: {item.size} · {tr("Colour", "Rangi")}: {item.color}
                      </p>
                      <p className="mt-1.5 text-xs font-semibold text-ink sm:hidden">
                        {format(item.price)}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.lineId)}
                          className="-ml-1 inline-flex items-center gap-1 px-1 py-2 text-xs font-medium text-zinc-500 transition hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t("cart.remove")}
                        </button>
                        {item.qty >= item.stock && item.stock > 0 && (
                          <span className="text-xs text-amber-700">
                            {tr("That's all we have", "Hizi ndizo zote zilizopo")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-center">
                    <span className="text-xs font-medium text-zinc-400 sm:hidden">
                      {t("cart.quantity")}
                    </span>
                    <QuantitySelector
                      value={item.qty}
                      max={item.stock}
                      onChange={(value) => updateQty(item.lineId, value)}
                      small
                    />
                  </div>

                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-bold text-ink">
                      {format(item.price * item.qty)}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {format(item.price)} {tr("each", "kila moja")}
                    </p>
                  </div>
                  <p className="text-right text-sm font-bold text-ink sm:hidden">
                    {format(item.price * item.qty)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-medium text-brand-900">
                <Truck className="h-4 w-4 text-brand-700" />
                {freeShip
                  ? t("cart.freeShip")
                  : `${format(FREE_SHIPPING_THRESHOLD - afterDiscount)} ${t("cart.freeShipLeft")}`}
              </p>
              <span className="text-[10px] font-semibold text-brand-700">
                {Math.min(100, shippingProgress(afterDiscount))}%
              </span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-500"
                style={{ width: `${shippingProgress(afterDiscount)}%` }}
              />
            </div>
          </div>

          <Link
            href="/shop"
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline"
          >
            ← {t("cart.continue")}
          </Link>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg font-extrabold">{t("cart.summary")}</h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4 text-zinc-600">
                <span>{t("cart.subtotal")}</span>
                <span className="font-medium text-ink">{format(cartSubtotal)}</span>
              </div>
              {discount && (
                <div className="flex justify-between gap-4 text-emerald-700">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    {discount.code}
                  </span>
                  <span className="font-medium">−{format(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between gap-4 text-zinc-600">
                <span>{t("cart.shipping")}</span>
                <span className="font-medium text-ink">
                  {freeShip ? t("common.free") : `${tr("from", "kuanzia")} ${format(estimatedShipping)}`}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500">
                {tr(
                  "The exact delivery fee depends on your region and is shown at checkout.",
                  "Gharama kamili ya usafirishaji inategemea mkoa wako na itaonyeshwa wakati wa kulipia."
                )}
              </p>
              <div className="border-t border-zinc-100 pt-3">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-ink">{t("cart.total")}</span>
                  <span className="font-display text-xl font-extrabold text-ink">
                    {format(total)}
                  </span>
                </div>
                {currency === "TZS" && (
                  <p className="mt-1 text-right text-xs text-zinc-500">
                    ≈ {formatPrice(total, "USD")}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 border-t border-zinc-100 pt-4">
              {discount ? (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5">
                  <div>
                    <p className="text-xs font-bold text-emerald-800">{discount.code}</p>
                    <p className="text-[10px] text-emerald-700">
                      {discount.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyDiscount(null)}
                    className="rounded-full p-1 text-emerald-700 transition hover:bg-emerald-100"
                    aria-label={tr("Remove discount", "Ondoa punguzo")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={applyCode}>
                  <label
                    htmlFor="discount-code"
                    className="flex items-center gap-1.5 text-sm font-semibold text-ink"
                  >
                    <Tag className="h-3.5 w-3.5 text-brand-700" />
                    {t("cart.coupon")}
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="discount-code"
                      value={code}
                      onChange={(event) => {
                        setCode(event.target.value.toUpperCase());
                        setCodeError("");
                      }}
                      placeholder={tr("Enter code", "Weka kuponi")}
                      className="field py-2.5 uppercase"
                      aria-invalid={Boolean(codeError)}
                      aria-describedby={codeError ? "discount-error" : undefined}
                      autoComplete="off"
                    />
                    <button
                      type="submit"
                      disabled={applying}
                      className="min-w-[72px] shrink-0 rounded-xl bg-ink px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
                    >
                      {applying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t("cart.apply")
                      )}
                    </button>
                  </div>
                  {codeError && (
                    <p id="discount-error" role="alert" className="mt-2 text-xs font-medium text-red-600">
                      {codeError}
                    </p>
                  )}
                </form>
              )}
            </div>

            <Link href="/checkout" className="btn-primary mt-5 w-full">
              {t("cart.checkout")}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-4 grid gap-2 text-xs text-zinc-600">
              <p className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-brand-700" />
                {tr("Pay in cash when your order arrives", "Lipa pesa taslimu mzigo ukifika")}
              </p>
              <p className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-brand-700" />
                {tr("Easy returns within 14 days", "Kurudisha ndani ya siku 14")}
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-700" />
                {tr("We never share your details", "Hatutoi taarifa zako kwa mtu yeyote")}
              </p>
            </div>
            <p className="mt-4 rounded-xl bg-sand px-3 py-2.5 text-xs leading-relaxed text-zinc-600">
              {tr(
                "M-Pesa, Mixx by Yas and Airtel Money payments are coming soon.",
                "Malipo kwa M-Pesa, Mixx by Yas na Airtel Money yanakuja hivi karibuni."
              )}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
