"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useStore } from "@/components/store-context";
import { COUNTRIES, FREE_SHIPPING_THRESHOLD, PAYMENT_METHODS, REGIONS } from "@/lib/constants";
import { formatTZS } from "@/lib/utils";

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
  const { cart, hydrated, discount, cartSubtotal, clearCart } = useStore();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const discountedSubtotal = Math.max(
    0,
    cartSubtotal - (discount ? Math.round((cartSubtotal * discount.percent) / 100) : 0)
  );
  const selectedRegion = REGIONS.find((region) => region.name === form.region);
  const shippingFee: number | null =
    discountedSubtotal >= FREE_SHIPPING_THRESHOLD || discount?.freeShipping
      ? 0
      : form.country === "Tanzania"
        ? selectedRegion?.fee ?? null
        : 35000;

  const updateField = <K extends keyof CheckoutForm>(field: K, value: CheckoutForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
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
      if (!response.ok) throw new Error(data.error || "Could not place your order.");
      if (!data.order?.id || !data.accessToken) {
        throw new Error("The order was placed, but its confirmation details could not be loaded.");
      }
      clearCart();
      const query = new URLSearchParams({
        access: data.accessToken,
        success: "1"
      });
      router.push(`/order/${encodeURIComponent(data.order.id)}?${query.toString()}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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

  if (cart.length === 0) {
    return (
      <div className="container-shell flex flex-col items-center py-24 text-center">
        <h1 className="font-display text-2xl font-extrabold">Kikapu chako ni tupu</h1>
        <p className="mt-2 text-sm text-zinc-500">Ongeza bidhaa kabla ya kulipia.</p>
        <Link href="/shop" className="btn-primary mt-6">Tazama bidhaa</Link>
      </div>
    );
  }

  return (
    <div className="container-shell py-8 sm:py-10 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-700">Malipo</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Kamilisha oda yako</h1>
        <p className="mt-2 text-sm text-zinc-500">Usafirishaji kote Tanzania. Bei zote ni TZS.</p>

        {error && (
          <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <form onSubmit={submit} className="mt-7 grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
            <h2 className="font-display text-lg font-extrabold">Taarifa za usafirishaji</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-zinc-700">
                Jina la kwanza
                <input className="field mt-1.5" autoComplete="given-name" value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} required />
              </label>
              <label className="text-xs font-semibold text-zinc-700">
                Jina la mwisho
                <input className="field mt-1.5" autoComplete="family-name" value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} required />
              </label>
              <label className="text-xs font-semibold text-zinc-700">
                Barua pepe
                <input className="field mt-1.5" type="email" autoComplete="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
              </label>
              <label className="text-xs font-semibold text-zinc-700">
                Simu (+255)
                <input className="field mt-1.5" type="tel" autoComplete="tel" placeholder="+255 7xx xxx xxx" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required />
              </label>
              <label className="text-xs font-semibold text-zinc-700">
                Nchi
                <select className="field mt-1.5" value={form.country} onChange={(event) => updateField("country", event.target.value)}>
                  {COUNTRIES.map((country) => <option key={country.value} value={country.value}>{country.label}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-zinc-700">
                Mkoa
                {form.country === "Tanzania" ? (
                  <select className="field mt-1.5" value={form.region} onChange={(event) => updateField("region", event.target.value)} required>
                    <option value="">Chagua mkoa</option>
                    {REGIONS.map((region) => <option key={region.id} value={region.name}>{region.name}</option>)}
                  </select>
                ) : (
                  <input className="field mt-1.5" value={form.region} onChange={(event) => updateField("region", event.target.value)} required />
                )}
              </label>
              <label className="text-xs font-semibold text-zinc-700">
                Jiji / Wilaya
                <input className="field mt-1.5" autoComplete="address-level2" value={form.city} onChange={(event) => updateField("city", event.target.value)} required />
              </label>
              <label className="text-xs font-semibold text-zinc-700 sm:col-span-2">
                Anwani kamili
                <input className="field mt-1.5" autoComplete="street-address" value={form.address} onChange={(event) => updateField("address", event.target.value)} required />
              </label>
              <label className="text-xs font-semibold text-zinc-700 sm:col-span-2">
                Maelekezo ya ziada (hiari)
                <textarea className="field mt-1.5 min-h-20" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} maxLength={500} />
              </label>
            </div>

            <div className="border-t border-zinc-100 pt-4">
              <h2 className="font-display text-lg font-extrabold">Njia ya malipo</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {PAYMENT_METHODS.filter((method) => method.available).map((method) => (
                  <label key={method.id} className="flex cursor-pointer gap-3 rounded-xl border border-zinc-200 p-3 text-xs">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={form.paymentMethod === method.id}
                      onChange={() => updateField("paymentMethod", method.id)}
                    />
                    <span>
                      <span className="block font-semibold text-ink">{method.id === "cod" ? "Malipo wakati wa kupokea" : method.label}</span>
                      <span className="mt-0.5 block text-zinc-500">{method.id === "cod" ? "Lipa pesa taslimu bidhaa zikifika." : method.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg font-extrabold">Muhtasari wa oda</h2>
            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.lineId} className="flex justify-between gap-3 text-xs">
                  <span className="text-zinc-600">{item.name} × {item.qty}</span>
                  <span className="shrink-0 font-semibold">{formatTZS(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-xs">
              <div className="flex justify-between"><span>Jumla ya bidhaa</span><span>{formatTZS(cartSubtotal)}</span></div>
              {discount && <div className="flex justify-between text-emerald-700"><span>Punguzo ({discount.code})</span><span>-{formatTZS(cartSubtotal - discountedSubtotal)}</span></div>}
              <div className="flex justify-between"><span>Usafirishaji</span><span>{shippingFee === null ? "Chagua mkoa" : shippingFee === 0 ? "Bure" : formatTZS(shippingFee)}</span></div>
              <div className="flex justify-between border-t border-zinc-100 pt-3 text-sm font-extrabold"><span>Jumla</span><span>{formatTZS(discountedSubtotal + (shippingFee ?? 0))}</span></div>
            </div>
            <button type="submit" disabled={submitting || !form.region} className="btn-primary mt-5 w-full py-3 text-sm font-semibold">
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Inatuma oda…</> : "Weka oda"}
            </button>
            <p className="mt-3 text-center text-[10px] leading-relaxed text-zinc-400">
              Kwa kuweka oda unathibitisha kuwa taarifa zako za usafirishaji ni sahihi.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}
