"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronRight,
  Loader2,
  Lock,
  ShieldCheck
} from "lucide-react";
import {
  COUNTRIES,
  FREE_SHIPPING_THRESHOLD,
  PAYMENT_METHODS,
  REGIONS
} from "@/lib/constants";
import {
  cn,
  isValidEmail,
  isValidTzPhone
} from "@/lib/utils";
import { useStore } from "@/components/store-context";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  city: string;
  address: string;
  notes: string;
};

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "Tanzania",
  region: "",
  city: "",
  address: "",
  notes: ""
};

export function CheckoutClient() {
  const router = useRouter();
  const {
    cart,
    hydrated,
    discount,
    format,
    cartSubtotal,
    clearCart,
    language,
    toast
  } = useStore();

  const [form, setForm] = useState<FormState>(initialForm);
  const [payment, setPayment] = useState("cod");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "agree" | "payment", string>>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  const isTanzania = form.country === "Tanzania";
  const selectedRegion = isTanzania
    ? REGIONS.find((region) => region.name === form.region)
    : null;

  const discountAmount = discount
    ? Math.round((cartSubtotal * discount.percent) / 100)
    : 0;
  const afterDiscount = Math.max(0, cartSubtotal - discountAmount);
  const baseShipping = isTanzania ? (selectedRegion?.fee ?? 0) : 35000;
  const freeShipping =
    afterDiscount >= FREE_SHIPPING_THRESHOLD ||
    Boolean(discount?.freeShipping);
  const shippingFee = freeShipping ? 0 : baseShipping;
  const total = afterDiscount + shippingFee;

  const paymentMethods = useMemo(
    () =>
      PAYMENT_METHODS.map((method) => ({
        ...method,
        note:
          method.id === "test"
            ? "Sandbox only — no real money is charged."
            : method.description
      })),
    []
  );

  if (!hydrated) {
    return (
      <div className="container-shell py-16">
        <div className="mx-auto max-w-xl space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
          <div className="h-72 animate-pulse rounded-2xl bg-zinc-100" />
        </div>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="container-shell flex flex-col items-center justify-center py-28 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-700" />
        <p className="mt-4 font-display text-xl font-bold">Confirming your order…</p>
        <p className="mt-1 text-sm text-zinc-500">Please don&apos;t close this page.</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container-shell flex flex-col items-center py-24 text-center">
        <h1 className="font-display text-2xl font-extrabold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Add a few pieces before heading to checkout.
        </p>
        <Link href="/shop" className="btn-primary mt-6">
          Shop the collection
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setServerError("");
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!form.firstName.trim()) next.firstName = "Enter your first name.";
    if (!form.lastName.trim()) next.lastName = "Enter your last name.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (!isValidTzPhone(form.phone))
      next.phone = "Enter a valid phone number, e.g. +255 712 345 678.";
    if (!form.country) next.country = "Choose a country.";
    if (!form.region.trim()) next.region = isTanzania ? "Choose your region." : "Enter your region.";
    if (!form.city.trim()) next.city = "Enter your city or town.";
    if (form.address.trim().length < 6)
      next.address = "Enter your street, area and house or apartment number.";
    if (!agree) next.agree = "Please accept the terms to place your order.";
    const method = PAYMENT_METHODS.find((item) => item.id === payment);
    if (!method || !method.available)
      next.payment = "Choose an available payment method.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setServerError("");
    if (!validate()) {
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            qty: item.qty
          })),
          customer: form,
          paymentMethod: payment,
          discountCode: discount?.code ?? null
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not place order.");
      setPlaced(true);
      clearCart();
      toast(
        language === "sw" ? "Oda yako imepokelewa!" : "Your order has been placed!"
      );
      router.push(`/order/${data.order.id}?success=1`);
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not place your order.";
      setServerError(message);
      toast(message, "error");
      setSubmitting(false);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const fieldError = (key: keyof FormState) =>
    errors[key] ? (
      <p className="mt-1 text-[10px] font-medium text-red-500">{errors[key]}</p>
    ) : null;

  return (
    <div className="container-shell py-8 sm:py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-zinc-500">
        <Link href="/" className="hover:text-brand-700">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/cart" className="hover:text-brand-700">
          Cart
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-ink">Checkout</span>
      </nav>

      <div className="mt-4">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Checkout
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Delivery across Tanzania. Pay in TZS; USD is available for reference.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-smoke/60 px-4 py-3 text-[11px]">
        <span className="flex items-center gap-1.5 font-medium text-ink">
          <Check className="h-3.5 w-3.5 text-brand-700" /> Cart
        </span>
        <span className="h-px flex-1 bg-zinc-300" />
        <span className="flex items-center gap-1.5 font-semibold text-brand-700">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-700 text-[9px] text-white">
            2
          </span>
          Delivery & payment
        </span>
        <span className="h-px flex-1 bg-zinc-300" />
        <span className="flex items-center gap-1.5 text-zinc-400">
          <span className="grid h-5 w-5 place-items-center rounded-full border border-zinc-300 text-[9px]">
            3
          </span>
          Confirmation
        </span>
      </div>

      <form onSubmit={submit} noValidate className="mt-7 grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-10">
        <div className="space-y-5">
          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {serverError}
            </div>
          )}

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-[11px] font-bold text-white">
                1
              </span>
              <div>
                <h2 className="font-display text-base font-extrabold">Contact details</h2>
                <p className="text-[11px] text-zinc-500">
                  We&apos;ll send your order confirmation here.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="text-[11px] font-semibold text-zinc-700">
                  First name *
                </label>
                <input
                  id="firstName"
                  value={form.firstName}
                  onChange={(event) => update("firstName", event.target.value)}
                  className={cn("field mt-1.5", errors.firstName && "border-red-300")}
                  autoComplete="given-name"
                />
                {fieldError("firstName")}
              </div>
              <div>
                <label htmlFor="lastName" className="text-[11px] font-semibold text-zinc-700">
                  Last name *
                </label>
                <input
                  id="lastName"
                  value={form.lastName}
                  onChange={(event) => update("lastName", event.target.value)}
                  className={cn("field mt-1.5", errors.lastName && "border-red-300")}
                  autoComplete="family-name"
                />
                {fieldError("lastName")}
              </div>
              <div>
                <label htmlFor="email" className="text-[11px] font-semibold text-zinc-700">
                  Email address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  className={cn("field mt-1.5", errors.email && "border-red-300")}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                {fieldError("email")}
              </div>
              <div>
                <label htmlFor="phone" className="text-[11px] font-semibold text-zinc-700">
                  Phone number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  className={cn("field mt-1.5", errors.phone && "border-red-300")}
                  autoComplete="tel"
                  placeholder="+255 712 345 678"
                />
                {fieldError("phone")}
              </div>
            </div>
            <p className="mt-3 text-[10px] text-zinc-400">
              Checking out as a guest.{" "}
              <Link href="/account" className="font-semibold text-brand-700 underline">
                Sign in
              </Link>{" "}
              to save your details next time.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-[11px] font-bold text-white">
                2
              </span>
              <div>
                <h2 className="font-display text-base font-extrabold">Delivery details</h2>
                <p className="text-[11px] text-zinc-500">
                  Tell us where to send your order.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="country" className="text-[11px] font-semibold text-zinc-700">
                  Country *
                </label>
                <select
                  id="country"
                  value={form.country}
                  onChange={(event) => {
                    update("country", event.target.value);
                    setForm((current) => ({ ...current, region: "" }));
                  }}
                  className={cn("field mt-1.5", errors.country && "border-red-300")}
                  autoComplete="country-name"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
                {fieldError("country")}
              </div>
              <div>
                <label htmlFor="region" className="text-[11px] font-semibold text-zinc-700">
                  {isTanzania ? "Region *" : "Region / state *"}
                </label>
                {isTanzania ? (
                  <select
                    id="region"
                    value={form.region}
                    onChange={(event) => update("region", event.target.value)}
                    className={cn("field mt-1.5", errors.region && "border-red-300")}
                  >
                    <option value="">Select a delivery region</option>
                    {REGIONS.map((region) => (
                      <option key={region.id} value={region.name}>
                        {region.name} — {format(region.fee)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="region"
                    value={form.region}
                    onChange={(event) => update("region", event.target.value)}
                    className={cn("field mt-1.5", errors.region && "border-red-300")}
                    placeholder="Region or state"
                    autoComplete="address-level1"
                  />
                )}
                {fieldError("region")}
              </div>
              <div>
                <label htmlFor="city" className="text-[11px] font-semibold text-zinc-700">
                  City / town *
                </label>
                <input
                  id="city"
                  value={form.city}
                  onChange={(event) => update("city", event.target.value)}
                  className={cn("field mt-1.5", errors.city && "border-red-300")}
                  autoComplete="address-level2"
                  placeholder="e.g. Masaki, Dar es Salaam"
                />
                {fieldError("city")}
              </div>
              <div>
                <label htmlFor="address" className="text-[11px] font-semibold text-zinc-700">
                  Street address *
                </label>
                <input
                  id="address"
                  value={form.address}
                  onChange={(event) => update("address", event.target.value)}
                  className={cn("field mt-1.5", errors.address && "border-red-300")}
                  autoComplete="street-address"
                  placeholder="Street, area, house or apartment number"
                />
                {fieldError("address")}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="text-[11px] font-semibold text-zinc-700">
                  Delivery notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  rows={2}
                  className="field mt-1.5 resize-none"
                  placeholder="Landmark, gate colour, best time to deliver…"
                />
              </div>
            </div>

            {selectedRegion && (
              <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-[10px] text-brand-800">
                {selectedRegion.name}: delivery in {selectedRegion.eta}. Fee{" "}
                {shippingFee === 0 ? "waived" : format(selectedRegion.fee)}.
              </p>
            )}

            {!isTanzania && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[10px] text-amber-800">
                International delivery is a flat {format(35000)} estimate. Our team
                will confirm the final cost by email before dispatch.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-[11px] font-bold text-white">
                3
              </span>
              <div>
                <h2 className="font-display text-base font-extrabold">Payment</h2>
                <p className="text-[11px] text-zinc-500">
                  Only payment methods with completed integrations are enabled.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {paymentMethods.map((method) => {
                const disabled = !method.available;
                return (
                  <label
                    key={method.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition",
                      payment === method.id
                        ? "border-brand-700 bg-brand-50/60"
                        : "border-zinc-200 bg-white hover:border-zinc-300",
                      disabled && "cursor-not-allowed bg-zinc-50/70 opacity-70 hover:border-zinc-200"
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={payment === method.id}
                      disabled={disabled}
                      onChange={() => {
                        setPayment(method.id);
                        setErrors((current) => ({ ...current, payment: undefined }));
                      }}
                      className="mt-0.5 h-4 w-4 accent-brand-700"
                    />
                    <span className="flex-1">
                      <span className="flex flex-wrap items-center gap-2 text-xs font-semibold text-ink">
                        {method.label}
                        {disabled && (
                          <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-500">
                            Coming soon
                          </span>
                        )}
                        {method.id === "test" && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                            Demo
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-relaxed text-zinc-500">
                        {method.note}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.payment && (
              <p className="mt-2 text-[10px] font-medium text-red-500">{errors.payment}</p>
            )}

            <p className="mt-4 flex items-start gap-2 rounded-lg bg-zinc-50 px-3 py-2.5 text-[10px] leading-relaxed text-zinc-500">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-700" />
              M-Pesa, Mixx by Yas and Airtel Money are shown for planning only. Their
              integrations are not active and no mobile-money charge can be made yet.
            </p>
          </section>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <label className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-relaxed text-zinc-600">
              <input
                type="checkbox"
                checked={agree}
                onChange={(event) => {
                  setAgree(event.target.checked);
                  setErrors((current) => ({ ...current, agree: undefined }));
                }}
                className="mt-0.5 h-4 w-4 accent-brand-700"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="font-semibold text-brand-700 underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="/returns" className="font-semibold text-brand-700 underline">
                  Returns Policy
                </Link>
                .
              </span>
            </label>
            {errors.agree && (
              <p className="mt-1.5 text-[10px] font-medium text-red-500">{errors.agree}</p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary mt-4 w-full">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Placing your order…
                </>
              ) : (
                <>
                  Place order · {format(total)}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400">
              <ShieldCheck className="h-3 w-3 text-brand-700" />
              Your information is transmitted securely and never sold.
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold">Order summary</h2>
              <Link href="/cart" className="text-[10px] font-semibold text-brand-700 hover:underline">
                Edit cart
              </Link>
            </div>

            <div className="mt-4 max-h-[290px] space-y-3 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.lineId} className="flex gap-3">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-smoke">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                    <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-700 px-1 text-[9px] font-bold text-white">
                      {item.qty}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-ink">{item.name}</p>
                    <p className="mt-0.5 text-[10px] text-zinc-400">
                      {item.size} · {item.color}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-ink">
                      {format(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2.5 border-t border-zinc-100 pt-4 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-medium text-ink">{format(cartSubtotal)}</span>
              </div>
              {discount && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({discount.code})</span>
                  <span className="font-medium">−{format(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>Delivery</span>
                <span className="font-medium text-ink">
                  {!isTanzania || selectedRegion
                    ? shippingFee === 0
                      ? "Free"
                      : format(shippingFee)
                    : "Select region"}
                </span>
              </div>
              {freeShipping && (
                <p className="text-[10px] font-medium text-emerald-700">
                  Free delivery unlocked.
                </p>
              )}
              <div className="flex items-baseline justify-between border-t border-zinc-100 pt-3">
                <span className="font-semibold text-ink">Total</span>
                <span className="font-display text-xl font-extrabold text-ink">
                  {format(total)}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2 rounded-xl bg-smoke/70 p-3 text-[10px] text-zinc-500">
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-700" />
                Cash on delivery available across Tanzania
              </p>
              <p className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-brand-700" />
                Easy 14-day returns
              </p>
              <p className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-brand-700" />
                Need help? Call +255 712 345 678
              </p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
