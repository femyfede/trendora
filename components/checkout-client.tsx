"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/components/store-context";

type FormState = {
  name: string;
  phone: string;
  location: string;
  quantity: string;
};

const initialForm: FormState = {
  name: "",
  phone: "",
  location: "",
  quantity: ""
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
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    const next: { [key: string]: string } = {};
    if (!form.name.trim()) next.name = "Jina linalohusika";
    if (!form.phone.trim()) next.phone = "Namba ya simu linalohusika";
    if (!form.location.trim()) next.location = "Mahali ulio linalohusika";
    if (!form.quantity.trim() || Number(form.quantity) < 1) next.quantity = "Idadi linalohusika";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (!validate()) {
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        size: item.size,
        color: item.color,
        qty: Number(form.quantity) || item.qty
      }));

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items,
          customer: {
            name: form.name,
            phone: form.phone,
            location: form.location
          },
          paymentMethod: "cod",
          discountCode: discount?.code ?? null
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create shop.");
      setError("Shop created! Pending admin approval.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
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
        <h1 className="font-display text-2xl font-extrabold">Kikapu chako ni tupu</h1>
        <p className="mt-2 text-sm text-zinc-500">Add a few pieces before heading to checkout.</p>
        <Link href="/shop" className="btn-primary mt-6">
          Tazama Mkusanyiko
          <svg className="h-4 w-4" aria-hidden="true"><polygon points="2,2 2,22 22,22 22,2"/></svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-shell py-8 sm:py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-zinc-500">
        <Link href="/" className="hover:text-brand-700">Nyumbani</Link>
        <svg className="h-3 w-3" aria-hidden="true"><polygon points="2,2 2,22 22,22 22,2"/></svg>
        <Link href="/cart" className="hover:text-brand-700">Kikapu</Link>
        <svg className="h-3 w-3" aria-hidden="true"><polygon points="2,2 2,22 22,22 22,2"/></svg>
        <span className="font-medium text-ink">Kusamehewa</span>
      </nav>

      <div className="mt-4">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Kusamehewa
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          Usafirishaji kote Tanzania. Malipo kwa TZS.
        </p>
      </div>

      <form onSubmit={submit} noValidate className="mt-7 grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-zinc-700">
              Jina *
            </label>
            <input
              id="shop-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="field mt-1.5"
              autoComplete="off"
              placeholder="e.g. Kijani Styles"
              required
            />
            <p className="mt-1 text-[10px] text-zinc-400">
              This will be your public shop name and URL slug.
            </p>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-700">
              Namba ya simu *
            </label>
            <input
              id="phone"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              className="field mt-1.5"
              type="tel"
              autoComplete="tel"
              placeholder="+255 712 345 678"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-700">
              Mahali ulipo *
            </label>
            <input
              id="location"
              value={form.location}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
              className="field mt-1.5"
              placeholder="Jiji/chini kilichotoka, mitaa"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-700">
              Idadi ya bidhaa *
            </label>
            <input
              id="quantity"
              value={form.quantity}
              onChange={(event) => setForm({ ...form, quantity: event.target.value })}
              className="field mt-1.5"
              type="number"
              min="1"
              required
            />
            <p className="text-[10px] text-zinc-400">
              Tafadhali idadi linalobanyikiwa
            </p>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-[11px] font-medium text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !form.name.trim()}
          className="btn-primary w-full py-3 text-sm font-semibold">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sasa kufikia…
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4 mr-2 inline-block align-middle"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                fill="none"
                aria-hidden="true"
              >
                <path d="M21 15l-6-6L3 9l14 6 6-6z" />
              </svg>
              Nunua Sasa
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-[10px] leading-relaxed text-zinc-400">
        <Mail className="mr-1 h-4 w-4 text-zinc-400" />
        Questions? Contact admin support to check on your shop approval status.
      </p>
    </div>
  );
}