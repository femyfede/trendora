"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Store } from "lucide-react";
import { CATEGORIES, REGIONS } from "@/lib/constants";
import type { PaymentRecord, ShopApplication } from "@/lib/types";
import { formatTZS } from "@/lib/utils";

type User = { id: string; name: string };
type ApplicationForm = {
  shopName: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  category: string;
  description: string;
  region: string;
  district: string;
  physicalLocation: string;
};

const emptyForm: ApplicationForm = {
  shopName: "",
  ownerName: "",
  phone: "",
  whatsapp: "",
  email: "",
  category: "",
  description: "",
  region: "",
  district: "",
  physicalLocation: ""
};

const paymentMethods = ["M-Pesa", "Mixx", "Airtel", "HaloPesa", "other"] as const;

export function CreateShopClient() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<ShopApplication[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [fee, setFee] = useState<number | null>(null);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentMethods)[number]>("M-Pesa");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState<ApplicationForm>(emptyForm);

  const loadApplications = useCallback(async () => {
    const response = await fetch("/api/shop-applications", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load your shop applications.");
    setApplications(data.applications);
    setPayments(data.payments);
    setFee(data.shopSettings.shopRegistrationFeeTzs);
    setInstructions(data.shopSettings.shopPaymentInstructions || "");
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();
        if (!active) return;
        if (!data.user) {
          setLoading(false);
          return;
        }
        setUser(data.user);
        setForm((current) => ({ ...current, ownerName: data.user.name }));
        const applicationsResponse = await fetch("/api/shop-applications", { cache: "no-store" });
        const applicationsData = await applicationsResponse.json();
        if (!applicationsResponse.ok) {
          throw new Error(applicationsData.error || "Could not load your shop applications.");
        }
        if (!active) return;
        setApplications(applicationsData.applications);
        setPayments(applicationsData.payments);
        setFee(applicationsData.shopSettings.shopRegistrationFeeTzs);
        setInstructions(applicationsData.shopSettings.shopPaymentInstructions || "");
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "Could not load this page.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const submitApplication = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/shop-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit your application.");
      await loadApplications();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not submit your application.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitPayment = async (event: React.FormEvent, applicationId: string) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, method: paymentMethod, reference })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit payment details.");
      setReference("");
      await loadApplications();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not submit payment details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-shell flex min-h-72 items-center justify-center text-sm text-zinc-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-brand-700" />
        Inapakia…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-shell py-20">
        <section className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <Store className="mx-auto h-8 w-8 text-brand-700" />
          <h1 className="mt-4 font-display text-2xl font-extrabold">Fungua duka lako</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            Ingia au fungua akaunti kwanza ili uweze kufuatilia ombi na malipo ya duka lako.
          </p>
          <Link href="/account" className="btn-primary mt-6 inline-flex">Ingia / Fungua akaunti</Link>
        </section>
      </div>
    );
  }

  const currentApplication = applications.find(
    (application) => !["REJECTED", "EXPIRED"].includes(application.status)
  );
  const applicationPayments = currentApplication
    ? payments.filter((payment) => payment.shopApplicationId === currentApplication.id)
    : [];
  const hasPendingPayment = applicationPayments.some((payment) => payment.status === "pending");

  return (
    <div className="container-shell py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-700">
          Kwa wafanyabiashara Tanzania
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Fungua duka lako
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
          Tuma taarifa za biashara yako na ufuatilie hatua ya ombi lako. Duka halitaonekana sokoni mpaka malipo yahakikiwe na ombi liidhinishwe.
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {currentApplication ? (
          <section className="mt-7 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-extrabold">{currentApplication.shopName}</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Ombi limetumwa {new Date(currentApplication.createdAt).toLocaleDateString("sw-TZ")}
                </p>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase text-amber-800">
                {currentApplication.status.replace(/_/g, " ")}
              </span>
            </div>

            {currentApplication.status === "ACTIVE" && (
              <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                Duka lako limeidhinishwa. Meneja wa bidhaa na maagizo bado hajasanidiwa.
              </p>
            )}
            {currentApplication.status === "PENDING_APPROVAL" && (
              <p className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                Malipo yamehakikiwa. Duka litasubiri idhini ya msimamizi kabla ya kuonekana kwa wateja.
              </p>
            )}
            {currentApplication.status === "PAYMENT_PROCESSING" && (
              <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                Maelezo ya malipo yametumwa kwa ukaguzi. Duka bado halijawezeshwa; usitume tena risiti hiyo.
              </p>
            )}

            {currentApplication.status === "PENDING_PAYMENT" && (
              <div className="mt-5 rounded-xl bg-smoke/70 p-4 sm:p-5">
                <p className="text-sm font-bold">Ada ya usajili: {fee ? formatTZS(fee) : "Haijawekwa"}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
                  {instructions || "Maelekezo ya malipo hayajawekwa. Wasiliana na msimamizi kabla ya kulipa."}
                </p>
                {!hasPendingPayment && fee && instructions.trim() && (
                  <form onSubmit={(event) => submitPayment(event, currentApplication.id)} className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold text-zinc-700">
                      Njia ya malipo
                      <select
                        className="field mt-1.5"
                        value={paymentMethod}
                        onChange={(event) => setPaymentMethod(event.target.value as (typeof paymentMethods)[number])}
                      >
                        <option value="M-Pesa">M-Pesa</option>
                        <option value="Mixx">Mixx by Yas</option>
                        <option value="Airtel">Airtel Money</option>
                        <option value="HaloPesa">HaloPesa</option>
                        <option value="other">Nyingine</option>
                      </select>
                    </label>
                    <label className="text-xs font-semibold text-zinc-700">
                      Namba ya muamala
                      <input
                        className="field mt-1.5"
                        value={reference}
                        onChange={(event) => setReference(event.target.value)}
                        minLength={4}
                        maxLength={100}
                        required
                      />
                    </label>
                    <p className="text-[11px] leading-relaxed text-zinc-500 sm:col-span-2">
                      Kutuma namba hii si uthibitisho wa malipo. Msimamizi atahakiki muamala kando.
                    </p>
                    <button disabled={submitting} type="submit" className="btn-primary sm:col-span-2">
                      {submitting ? "Inatumwa…" : "Nimetuma malipo"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {applicationPayments.length > 0 && (
              <div className="mt-5 space-y-2">
                <h3 className="text-xs font-bold">Historia ya malipo</h3>
                {applicationPayments.map((payment) => (
                  <div key={payment.id} className="flex flex-wrap justify-between gap-2 rounded-lg border border-zinc-100 p-3 text-xs">
                    <span>{payment.method} · {payment.reference} · {formatTZS(payment.amount)}</span>
                    <span className="font-semibold">{payment.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <form onSubmit={submitApplication} className="mt-7 grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:grid-cols-2 sm:p-7">
            <label className="text-xs font-semibold text-zinc-700 sm:col-span-2">
              Jina la duka
              <input className="field mt-1.5" value={form.shopName} onChange={(event) => setForm({ ...form, shopName: event.target.value })} minLength={3} maxLength={100} required />
            </label>
            <label className="text-xs font-semibold text-zinc-700">
              Jina kamili la mmiliki
              <input className="field mt-1.5" value={form.ownerName} onChange={(event) => setForm({ ...form, ownerName: event.target.value })} maxLength={100} required />
            </label>
            <label className="text-xs font-semibold text-zinc-700">
              Simu (+255)
              <input className="field mt-1.5" type="tel" placeholder="+255 7xx xxx xxx" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
            </label>
            <label className="text-xs font-semibold text-zinc-700">
              WhatsApp (hiari)
              <input className="field mt-1.5" type="tel" placeholder="+255 7xx xxx xxx" value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} />
            </label>
            <label className="text-xs font-semibold text-zinc-700">
              Barua pepe (hiari)
              <input className="field mt-1.5" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
            <label className="text-xs font-semibold text-zinc-700">
              Aina ya biashara
              <select className="field mt-1.5" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required>
                <option value="">Chagua aina</option>
                {CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.swLabel}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-zinc-700">
              Mkoa
              <select className="field mt-1.5" value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} required>
                <option value="">Chagua mkoa</option>
                {REGIONS.map((region) => <option key={region.id} value={region.name}>{region.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-zinc-700">
              Wilaya
              <input className="field mt-1.5" value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })} maxLength={100} required />
            </label>
            <label className="text-xs font-semibold text-zinc-700 sm:col-span-2">
              Maelezo ya duka
              <textarea className="field mt-1.5 min-h-28" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} minLength={20} maxLength={2000} required />
            </label>
            <label className="text-xs font-semibold text-zinc-700 sm:col-span-2">
              Anwani ya duka
              <input className="field mt-1.5" value={form.physicalLocation} onChange={(event) => setForm({ ...form, physicalLocation: event.target.value })} maxLength={300} required />
            </label>
            {fee == null || !instructions.trim() ? (
              <p className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 sm:col-span-2">
                Usajili wa maduka haujafunguliwa bado. Msimamizi lazima aweke ada na maelekezo ya malipo.
              </p>
            ) : (
              <p className="rounded-xl bg-smoke p-3 text-xs text-zinc-600 sm:col-span-2">
                Ada ya usajili: <strong>{formatTZS(fee)}</strong>. Duka litaendelea kuwa la faragha mpaka malipo yahakikiwe na ombi liidhinishwe.
              </p>
            )}
            <button type="submit" disabled={submitting || fee == null || !instructions.trim()} className="btn-primary sm:col-span-2">
              {submitting ? "Inatuma ombi…" : "Tuma ombi la kufungua duka"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
