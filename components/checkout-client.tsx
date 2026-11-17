"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Banknote, Loader2, Lock, ShoppingBag, Truck } from "lucide-react";
import { useStore } from "@/components/store-context";
import {
  COUNTRIES,
  FREE_SHIPPING_THRESHOLD,
  INTERNATIONAL_SHIPPING_FEE,
  PAYMENT_METHODS,
  SELECTABLE_REGIONS,
  formatEta
} from "@/lib/constants";
import { cn, formatTZS, isValidEmail, isValidTzPhone } from "@/lib/utils";

type CheckoutForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  city: string;
  address: string;
  notes: string;
  paymentMethod: string;
};

type FieldErrors = Partial<Record<keyof CheckoutForm, string>>;

const initialForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "Tanzania",
  region: "",
  city: "",
  address: "",
  notes: "",
  paymentMethod: "cod"
};

export function CheckoutClient() {
  const router = useRouter();
  const { cart, hydrated, discount, cartSubtotal, clearCart, tr, t, language, user } = useStore();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submittingRef = useRef(false);

  // Pre-fill what we already know about a signed-in customer.
  useEffect(() => {
    if (!user) return;
    const [first, ...rest] = user.name.split(" ");
    setForm((current) => ({
      ...current,
      firstName: current.firstName || first || "",
      lastName: current.lastName || rest.join(" "),
      email: current.email || user.email
    }));
  }, [user]);

  const discountAmount = discount ? Math.round((cartSubtotal * discount.percent) / 100) : 0;
  const discountedSubtotal = Math.max(0, cartSubtotal - discountAmount);
  const selectedRegion = SELECTABLE_REGIONS.find((region) => region.name === form.region);
  const freeShipping = discountedSubtotal >= FREE_SHIPPING_THRESHOLD || Boolean(discount?.freeShipping);
  const shippingFee: number | null = freeShipping
    ? 0
    : form.country === "Tanzania"
      ? selectedRegion?.fee ?? null
      : INTERNATIONAL_SHIPPING_FEE;
  const paymentOptions = PAYMENT_METHODS.filter((method) => method.available);
  const comingSoon = PAYMENT_METHODS.filter((method) => !method.available && method.id !== "test");

  const updateField = <K extends keyof CheckoutForm>(field: K, value: CheckoutForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!form.firstName.trim()) next.firstName = tr("Enter your first name.", "Weka jina lako la kwanza.");
    if (!form.lastName.trim()) next.lastName = tr("Enter your last name.", "Weka jina lako la mwisho.");
    if (!isValidEmail(form.email)) next.email = tr("Enter a valid email address.", "Weka barua pepe sahihi.");
    if (!isValidTzPhone(form.phone))
      next.phone = tr("Enter a valid phone number, e.g. 0712 345 678.", "Weka namba ya simu sahihi, mfano 0712 345 678.");
    if (!form.region.trim()) next.region = tr("Choose your region.", "Chagua mkoa wako.");
    if (!form.city.trim()) next.city = tr("Enter your town or district.", "Weka mji au wilaya yako.");
    if (!form.address.trim())
      next.address = tr("Enter your street, area or a landmark.", "Weka mtaa, eneo au alama inayojulikana.");
    return next;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      setError(tr("Please correct the highlighted details.", "Tafadhali rekebisha taarifa zilizowekewa alama."));
      const first = Object.keys(found)[0];
      document.getElementById(`checkout-${first}`)?.focus();
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

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
          customer: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            country: form.country,
            region: form.region,
            city: form.city,
            address: form.address,
            notes: form.notes
          },
          paymentMethod: form.paymentMethod,
          discountCode: discount?.code ?? null
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("common.error"));
      if (!data.order?.id || !data.accessToken) throw new Error(t("common.error"));
      const query = new URLSearchParams({ access: data.accessToken, success: "1" });
      // Navigate first, then clear the cart, so the empty-cart screen never flashes.
      router.push(`/order/${encodeURIComponent(data.order.id)}?${query.toString()}`);
      clearCart();
    } catch (caught) {
      submittingRef.current = false;
      setSubmitting(false);
      setError(
        caught instanceof TypeError
          ? t("common.network")
          : caught instanceof Error
            ? caught.message
            : t("common.error")
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!hydrated) {
    return (
      <div className="container-shell py-16" aria-busy="true">
        <div className="mx-auto max-w-xl space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
          <div className="h-72 animate-pulse rounded-2xl bg-zinc-100" />
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !submitting) {
    return (
      <div className="container-shell flex flex-col items-center py-24 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-700">
          <ShoppingBag className="h-7 w-7" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-extrabold">{t("cart.empty")}</h1>
        <p className="mt-2 text-base text-zinc-600">
          {tr("Add products to your cart before checking out.", "Weka bidhaa kwenye kikapu kabla ya kulipia.")}
        </p>
        <Link href="/shop" className="btn-primary mt-6">
          {tr("Browse products", "Tazama bidhaa")}
        </Link>
      </div>
    );
  }

  const fieldProps = (field: keyof CheckoutForm) => ({
    id: `checkout-${field}`,
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `checkout-${field}-error` : undefined
  });
  const fieldError = (field: keyof CheckoutForm) =>
    errors[field] ? (
      <p id={`checkout-${field}-error`} className="mt-1 text-xs font-medium text-red-600">
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className="container-shell py-8 sm:py-10 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <p className="section-kicker">{tr("Checkout", "Kulipia")}</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {tr("Complete your order", "Kamilisha oda yako")}
        </h1>
        <p className="mt-2 text-base text-zinc-600">
          {tr(
            "We deliver to every region of Tanzania. All prices are in TZS.",
            "Tunafikisha mikoa yote ya Tanzania. Bei zote ni kwa TZS."
          )}
        </p>

        {error && (
          <p role="alert" className="alert-error mt-5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <form onSubmit={submit} noValidate className="mt-7 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
              <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-xs text-white">1</span>
                {tr("Your details", "Taarifa zako")}
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkout-firstName" className="label">{tr("First name", "Jina la kwanza")}</label>
                  <input className="field mt-1.5" {...fieldProps("firstName")} autoComplete="given-name" value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} maxLength={60} />
                  {fieldError("firstName")}
                </div>
                <div>
                  <label htmlFor="checkout-lastName" className="label">{tr("Last name", "Jina la mwisho")}</label>
                  <input className="field mt-1.5" {...fieldProps("lastName")} autoComplete="family-name" value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} maxLength={60} />
                  {fieldError("lastName")}
                </div>
                <div>
                  <label htmlFor="checkout-phone" className="label">{tr("Phone number", "Namba ya simu")}</label>
                  <input className="field mt-1.5" {...fieldProps("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} maxLength={30} />
                  {errors.phone ? (
                    fieldError("phone")
                  ) : (
                    <p className="hint">{tr("We will call this number before delivery.", "Tutakupigia namba hii kabla ya kukuletea mzigo.")}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="checkout-email" className="label">{tr("Email", "Barua pepe")}</label>
                  <input className="field mt-1.5" {...fieldProps("email")} type="email" inputMode="email" autoComplete="email" placeholder="jina@mfano.com" value={form.email} onChange={(event) => updateField("email", event.target.value)} maxLength={200} />
                  {errors.email ? (
                    fieldError("email")
                  ) : (
                    <p className="hint">{tr("For your order confirmation.", "Kwa ajili ya uthibitisho wa oda yako.")}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
              <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-xs text-white">2</span>
                {tr("Delivery address", "Mahali pa kuletewa")}
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkout-country" className="label">{tr("Country", "Nchi")}</label>
                  <select
                    className="field mt-1.5"
                    {...fieldProps("country")}
                    value={form.country}
                    onChange={(event) => {
                      updateField("country", event.target.value);
                      updateField("region", "");
                    }}
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="checkout-region" className="label">{tr("Region", "Mkoa")}</label>
                  {form.country === "Tanzania" ? (
                    <select className="field mt-1.5" {...fieldProps("region")} value={form.region} onChange={(event) => updateField("region", event.target.value)}>
                      <option value="">{tr("Choose region", "Chagua mkoa")}</option>
                      {SELECTABLE_REGIONS.map((region) => (
                        <option key={region.id} value={region.name}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input className="field mt-1.5" {...fieldProps("region")} value={form.region} onChange={(event) => updateField("region", event.target.value)} maxLength={80} />
                  )}
                  {errors.region ? (
                    fieldError("region")
                  ) : selectedRegion ? (
                    <p className="hint">
                      {tr("Arrives in", "Inafika ndani ya")} {formatEta(selectedRegion.eta, language)} ·{" "}
                      {freeShipping ? t("common.free") : formatTZS(selectedRegion.fee)}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="checkout-city" className="label">{tr("Town / District", "Mji / Wilaya")}</label>
                  <input className="field mt-1.5" {...fieldProps("city")} autoComplete="address-level2" placeholder={tr("e.g. Kinondoni", "mfano: Kinondoni")} value={form.city} onChange={(event) => updateField("city", event.target.value)} maxLength={100} />
                  {fieldError("city")}
                </div>
                <div>
                  <label htmlFor="checkout-address" className="label">{tr("Street / area", "Mtaa / eneo")}</label>
                  <input className="field mt-1.5" {...fieldProps("address")} autoComplete="street-address" placeholder={tr("e.g. Sinza Mori, near the mosque", "mfano: Sinza Mori, karibu na msikiti")} value={form.address} onChange={(event) => updateField("address", event.target.value)} maxLength={300} />
                  {fieldError("address")}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-notes" className="label">
                    {tr("Directions for the delivery person", "Maelekezo kwa msafirishaji")}{" "}
                    <span className="font-normal text-zinc-500">({tr("optional", "si lazima")})</span>
                  </label>
                  <textarea className="field mt-1.5 min-h-20" id="checkout-notes" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} maxLength={500} />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
              <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-xs text-white">3</span>
                {tr("Payment", "Malipo")}
              </h2>
              <fieldset className="mt-5">
                <legend className="sr-only">{tr("Payment method", "Njia ya malipo")}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {paymentOptions.map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-xl border p-4 transition",
                        form.paymentMethod === method.id ? "border-brand-700 bg-brand-50/60 ring-1 ring-brand-700" : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={form.paymentMethod === method.id}
                        onChange={() => updateField("paymentMethod", method.id)}
                        className="mt-1 accent-brand-700"
                      />
                      <span>
                        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                          {method.id === "cod" && <Banknote className="h-4 w-4 text-brand-700" />}
                          {method.label[language]}
                        </span>
                        <span className="mt-0.5 block text-sm text-zinc-600">{method.description[language]}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {comingSoon.length > 0 && (
                <p className="mt-3 text-xs text-zinc-500">
                  {tr("Coming soon:", "Zinakuja hivi karibuni:")} {comingSoon.map((method) => method.label[language]).join(", ")}
                </p>
              )}
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-extrabold">{t("cart.summary")}</h2>
            <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto">
              {cart.map((item) => (
                <li key={item.lineId} className="flex items-center gap-3">
                  <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-smoke">
                    <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="block truncate font-medium text-ink">{item.name}</span>
                    <span className="block text-xs text-zinc-500">
                      {item.size} · {item.color} · ×{item.qty}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold">{formatTZS(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-600">{t("cart.subtotal")}</dt>
                <dd>{formatTZS(cartSubtotal)}</dd>
              </div>
              {discount && discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>
                    {t("cart.discount")} ({discount.code})
                  </dt>
                  <dd>−{formatTZS(discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="flex items-center gap-1.5 text-zinc-600">
                  <Truck className="h-4 w-4" />
                  {t("cart.shipping")}
                </dt>
                <dd>
                  {shippingFee === null
                    ? tr("Choose region", "Chagua mkoa")
                    : shippingFee === 0
                      ? t("common.free")
                      : formatTZS(shippingFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-zinc-100 pt-3 text-base font-extrabold">
                <dt>{t("cart.total")}</dt>
                <dd>{formatTZS(discountedSubtotal + (shippingFee ?? 0))}</dd>
              </div>
            </dl>
            <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full py-4 text-base">
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {tr("Placing order…", "Inatuma oda…")}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  {tr("Place order", "Thibitisha oda")}
                </>
              )}
            </button>
            <p className="mt-3 text-center text-xs leading-relaxed text-zinc-500">
              {tr("By placing your order you agree to our", "Kwa kuweka oda unakubali")}{" "}
              <Link href="/terms" className="underline">
                {t("footer.terms")}
              </Link>
              .
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}
