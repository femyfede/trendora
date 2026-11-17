"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, BadgeCheck, CheckCircle2, Clock, Loader2, Store } from "lucide-react";
import { IMAGES, SELECTABLE_REGIONS, SHOP_CATEGORIES, SHOP_STATUS_LABELS } from "@/lib/constants";
import type { PaymentRecord, ShopApplication } from "@/lib/types";
import { cn, formatDate, formatTZS, isValidEmail } from "@/lib/utils";
import { useStore } from "./store-context";

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

const paymentMethods = [
  { value: "M-Pesa", label: "M-Pesa" },
  { value: "Mixx", label: "Mixx by Yas" },
  { value: "Airtel", label: "Airtel Money" },
  { value: "HaloPesa", label: "HaloPesa" },
  { value: "other", label: "Other / Nyingine" }
] as const;

const isTzMobile = (value: string) => /^(\+255|0)[67]\d{8}$/.test(value.replace(/[\s()-]/g, ""));

const PAYMENT_STATUS: Record<string, { en: string; sw: string }> = {
  pending: { en: "Being checked", sw: "Inahakikiwa" },
  verified: { en: "Confirmed", sw: "Imethibitishwa" },
  rejected: { en: "Not accepted", sw: "Haikukubaliwa" },
  failed: { en: "Failed", sw: "Imeshindikana" }
};

export function CreateShopClient() {
  const { tr, t, language, user, userLoaded, toast } = useStore();
  const [applications, setApplications] = useState<ShopApplication[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [fee, setFee] = useState<number | null>(null);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentMethods)[number]["value"]>("M-Pesa");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState<ApplicationForm>(emptyForm);

  const loadApplications = useCallback(async () => {
    const response = await fetch("/api/shop-applications", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || t("common.error"));
    setApplications(data.applications);
    setPayments(data.payments);
    setFee(data.shopSettings.shopRegistrationFeeTzs);
    setInstructions(data.shopSettings.shopPaymentInstructions || "");
  }, [t]);

  useEffect(() => {
    if (!userLoaded) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;
    setForm((current) => ({ ...current, ownerName: current.ownerName || user.name, email: current.email || user.email }));
    loadApplications()
      .catch((caught) => active && setError(caught instanceof TypeError ? t("common.network") : caught instanceof Error ? caught.message : t("common.error")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user, userLoaded, loadApplications, t]);

  const update = (key: keyof ApplicationForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submitApplication = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError("");
    if (form.shopName.trim().length < 3) return setError(tr("Enter your shop name (at least 3 characters).", "Weka jina la duka (angalau herufi 3)."));
    if (!isTzMobile(form.phone)) return setError(tr("Enter a valid Tanzanian mobile number, e.g. 0712 345 678.", "Weka namba sahihi ya simu, mfano 0712 345 678."));
    if (form.whatsapp && !isTzMobile(form.whatsapp)) return setError(tr("Check the WhatsApp number.", "Hakiki namba ya WhatsApp."));
    if (form.email && !isValidEmail(form.email)) return setError(tr("Enter a valid email address.", "Weka barua pepe sahihi."));
    if (!form.category) return setError(tr("Choose the type of business.", "Chagua aina ya biashara."));
    if (!form.region) return setError(tr("Choose your region.", "Chagua mkoa wako."));
    if (form.description.trim().length < 20)
      return setError(tr("Describe your shop in at least 20 characters.", "Elezea duka lako kwa angalau herufi 20."));

    setSubmitting(true);
    try {
      const response = await fetch("/api/shop-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("common.error"));
      await loadApplications();
      toast(tr("Application received. Next step: payment.", "Ombi limepokelewa. Hatua inayofuata: malipo."));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setError(caught instanceof TypeError ? t("common.network") : caught instanceof Error ? caught.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const submitPayment = async (event: React.FormEvent, applicationId: string) => {
    event.preventDefault();
    if (submitting) return;
    if (reference.trim().length < 4) {
      setError(tr("Enter the transaction ID from your payment SMS.", "Weka namba ya muamala kutoka kwenye SMS ya malipo."));
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, method: paymentMethod, reference: reference.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("common.error"));
      setReference("");
      await loadApplications();
      toast(tr("Payment details sent. We will confirm soon.", "Taarifa za malipo zimetumwa. Tutathibitisha hivi karibuni."));
    } catch (caught) {
      setError(caught instanceof TypeError ? t("common.network") : caught instanceof Error ? caught.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const intro = (
    <div className="relative overflow-hidden rounded-3xl bg-brand-900 text-white">
      <Image src={IMAGES.tailor} alt="" fill sizes="(max-width: 768px) 100vw, 900px" className="object-cover object-[center_30%] opacity-35" />
      <div className="relative px-6 py-10 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sun-400">{tr("For business owners", "Kwa wafanyabiashara")}</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("nav.addShop")}</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-white/85">
          {tr(
            "List your shop on TRENDORA so customers across Tanzania can find you and contact you directly by phone or WhatsApp.",
            "Weka duka lako TRENDORA ili wateja kote Tanzania wakupate na kuwasiliana nawe moja kwa moja kwa simu au WhatsApp."
          )}
        </p>
      </div>
    </div>
  );

  if (loading || !userLoaded) {
    return (
      <div className="container-shell flex min-h-72 items-center justify-center text-sm text-zinc-500" aria-busy="true">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-700" />
        {t("common.loading")}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-shell py-8 sm:py-12">
        <div className="mx-auto max-w-3xl">
          {intro}
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-center sm:p-8">
            <Store className="mx-auto h-8 w-8 text-brand-700" />
            <h2 className="mt-3 font-display text-xl font-extrabold">{tr("First, log in or create an account", "Kwanza, ingia au fungua akaunti")}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-600">
              {tr(
                "Your account lets you follow your application and payment. It is free and takes a minute.",
                "Akaunti inakusaidia kufuatilia ombi na malipo yako. Ni bure na inachukua dakika moja."
              )}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/account?mode=register&next=/create-shop" className="btn-primary">
                {tr("Create account", "Fungua akaunti")}
              </Link>
              <Link href="/account?next=/create-shop" className="btn-outline">
                {t("nav.login")}
              </Link>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const currentApplication = applications.find((application) => !["REJECTED", "EXPIRED"].includes(application.status));
  const lastRejected = !currentApplication ? applications.find((application) => application.status === "REJECTED") : undefined;
  const applicationPayments = currentApplication
    ? payments.filter((payment) => payment.shopApplicationId === currentApplication.id)
    : [];
  const hasPendingPayment = applicationPayments.some((payment) => payment.status === "pending");
  const registrationOpen = fee != null && Boolean(instructions.trim());

  const stepIndex = !currentApplication
    ? 0
    : currentApplication.status === "PENDING_PAYMENT"
      ? 1
      : currentApplication.status === "PAYMENT_PROCESSING" || currentApplication.status === "PENDING_APPROVAL"
        ? 2
        : 3;
  const steps = [
    tr("Shop details", "Taarifa za duka"),
    tr("Payment", "Malipo"),
    tr("Verification", "Uhakiki"),
    tr("Shop is live", "Duka liko hewani")
  ];

  return (
    <div className="container-shell py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        {intro}

        <ol className="mt-6 grid grid-cols-4 gap-2" aria-label={tr("Progress", "Hatua")}>
          {steps.map((step, index) => (
            <li key={step} className="text-center" aria-current={index === stepIndex ? "step" : undefined}>
              <span
                className={cn(
                  "mx-auto grid h-9 w-9 place-items-center rounded-full text-sm font-bold",
                  index < stepIndex ? "bg-emerald-600 text-white" : index === stepIndex ? "bg-brand-700 text-white" : "bg-zinc-100 text-zinc-500"
                )}
              >
                {index < stepIndex ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
              </span>
              <span className={cn("mt-2 block text-xs font-semibold leading-tight", index === stepIndex ? "text-ink" : "text-zinc-500")}>{step}</span>
            </li>
          ))}
        </ol>

        {error && (
          <p role="alert" className="alert-error mt-6">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {currentApplication ? (
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-extrabold">{currentApplication.shopName}</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {tr("Applied on", "Ombi lilitumwa")} {formatDate(currentApplication.createdAt, language)}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold",
                  currentApplication.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-sun-100 text-amber-800"
                )}
              >
                {SHOP_STATUS_LABELS[currentApplication.status]?.[language] ?? currentApplication.status}
              </span>
            </div>

            {currentApplication.status === "ACTIVE" && (
              <div className="alert-success mt-5">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">{tr("Your shop is live!", "Hongera! Duka lako liko hewani.")}</p>
                  <p className="mt-1 font-normal">
                    {tr("Customers can now find your shop in the directory and contact you.", "Wateja sasa wanaweza kuliona duka lako kwenye orodha ya maduka na kuwasiliana nawe.")}{" "}
                    <Link href="/shops" className="font-semibold underline">
                      {tr("See it in the directory", "Liangalie kwenye orodha")}
                    </Link>
                  </p>
                </div>
              </div>
            )}
            {currentApplication.status === "PENDING_APPROVAL" && (
              <p className="alert-info mt-5">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                {tr(
                  "Your payment is confirmed. Our team is reviewing your shop and will approve it shortly.",
                  "Malipo yako yamethibitishwa. Timu yetu inakagua duka lako na italiidhinisha hivi karibuni."
                )}
              </p>
            )}
            {currentApplication.status === "PAYMENT_PROCESSING" && (
              <p className="alert-info mt-5">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                {tr(
                  "We received your payment details and are checking them. You don't need to send them again.",
                  "Tumepokea taarifa zako za malipo na tunazihakiki. Huhitaji kuzituma tena."
                )}
              </p>
            )}

            {currentApplication.status === "PENDING_PAYMENT" && (
              <div className="mt-5 rounded-2xl bg-sand p-5">
                <p className="text-base font-bold">
                  {tr("Registration fee:", "Ada ya usajili:")} {fee ? formatTZS(fee) : tr("not set yet", "bado haijawekwa")}
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-700">{tr("How to pay:", "Jinsi ya kulipa:")}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                  {instructions || tr("Payment instructions are not available yet. Please contact us before paying.", "Maelekezo ya malipo bado hayajawekwa. Tafadhali wasiliana nasi kabla ya kulipa.")}
                </p>
                {!hasPendingPayment && fee && instructions.trim() && (
                  <form onSubmit={(event) => submitPayment(event, currentApplication.id)} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="pay-method" className="label">{tr("How did you pay?", "Ulilipa kwa njia gani?")}</label>
                      <select id="pay-method" className="field mt-1.5" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as typeof paymentMethod)}>
                        {paymentMethods.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="pay-ref" className="label">{tr("Transaction ID", "Namba ya muamala")}</label>
                      <input
                        id="pay-ref"
                        className="field mt-1.5 uppercase"
                        value={reference}
                        onChange={(event) => setReference(event.target.value)}
                        placeholder={tr("e.g. QK71ABC2XY", "mfano: QK71ABC2XY")}
                        maxLength={100}
                        autoComplete="off"
                      />
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-600 sm:col-span-2">
                      {tr(
                        "You'll find the transaction ID in the confirmation SMS. Your shop goes live only after we confirm the payment.",
                        "Namba ya muamala iko kwenye SMS ya uthibitisho. Duka litaonekana hewani baada ya sisi kuthibitisha malipo."
                      )}
                    </p>
                    <button disabled={submitting} type="submit" className="btn-primary sm:col-span-2">
                      {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {submitting ? tr("Sending…", "Inatuma…") : tr("I have paid, send details", "Nimelipa, tuma taarifa")}
                    </button>
                  </form>
                )}
              </div>
            )}

            {applicationPayments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold">{tr("Payment history", "Historia ya malipo")}</h3>
                <ul className="mt-2 space-y-2">
                  {applicationPayments.map((payment) => (
                    <li key={payment.id} className="flex flex-wrap justify-between gap-2 rounded-xl border border-zinc-100 p-3 text-sm">
                      <span>
                        {payment.method} · {payment.reference} · {formatTZS(payment.amount)}
                      </span>
                      <span className="font-semibold">{PAYMENT_STATUS[payment.status]?.[language] ?? payment.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ) : (
          <form onSubmit={submitApplication} noValidate className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
            {lastRejected && (
              <p className="alert-info mb-5">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                {tr(
                  `Your previous application (${lastRejected.shopName}) was not approved. You can apply again below, or contact us for help.`,
                  `Ombi lako la awali (${lastRejected.shopName}) halikuidhinishwa. Unaweza kuomba tena hapa chini, au wasiliana nasi kwa msaada.`
                )}
              </p>
            )}

            <h2 className="font-display text-lg font-extrabold">{tr("Tell us about your shop", "Tueleze kuhusu duka lako")}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="shop-name" className="label">{tr("Shop name", "Jina la duka")}</label>
                <input id="shop-name" className="field mt-1.5" value={form.shopName} onChange={(event) => update("shopName", event.target.value)} placeholder={tr("e.g. Mama Neema Fashion", "mfano: Mama Neema Fashion")} maxLength={100} />
              </div>
              <div>
                <label htmlFor="shop-owner" className="label">{tr("Owner's full name", "Jina kamili la mmiliki")}</label>
                <input id="shop-owner" className="field mt-1.5" value={form.ownerName} onChange={(event) => update("ownerName", event.target.value)} autoComplete="name" maxLength={100} />
              </div>
              <div>
                <label htmlFor="shop-category" className="label">{tr("Type of business", "Aina ya biashara")}</label>
                <select id="shop-category" className="field mt-1.5" value={form.category} onChange={(event) => update("category", event.target.value)}>
                  <option value="">{tr("Choose", "Chagua")}</option>
                  {SHOP_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {language === "sw" ? category.swLabel : category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="shop-phone" className="label">{tr("Phone number", "Namba ya simu")}</label>
                <input id="shop-phone" className="field mt-1.5" type="tel" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" value={form.phone} onChange={(event) => update("phone", event.target.value)} maxLength={20} />
                <p className="hint">{tr("Customers will call this number.", "Wateja watapiga namba hii.")}</p>
              </div>
              <div>
                <label htmlFor="shop-whatsapp" className="label">
                  WhatsApp <span className="font-normal text-zinc-500">({tr("optional", "si lazima")})</span>
                </label>
                <input id="shop-whatsapp" className="field mt-1.5" type="tel" inputMode="tel" placeholder="0712 345 678" value={form.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} maxLength={20} />
                <p className="hint">{tr("Leave empty if it's the same number.", "Acha wazi kama ni namba ile ile.")}</p>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="shop-email" className="label">
                  {tr("Email", "Barua pepe")} <span className="font-normal text-zinc-500">({tr("optional", "si lazima")})</span>
                </label>
                <input id="shop-email" className="field mt-1.5" type="email" inputMode="email" value={form.email} onChange={(event) => update("email", event.target.value)} maxLength={200} />
              </div>
              <div>
                <label htmlFor="shop-region" className="label">{tr("Region", "Mkoa")}</label>
                <select id="shop-region" className="field mt-1.5" value={form.region} onChange={(event) => update("region", event.target.value)}>
                  <option value="">{tr("Choose region", "Chagua mkoa")}</option>
                  {SELECTABLE_REGIONS.map((region) => (
                    <option key={region.id} value={region.name}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="shop-district" className="label">{tr("District", "Wilaya")}</label>
                <input id="shop-district" className="field mt-1.5" value={form.district} onChange={(event) => update("district", event.target.value)} placeholder={tr("e.g. Ilala", "mfano: Ilala")} maxLength={100} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="shop-location" className="label">{tr("Where is the shop?", "Duka liko wapi?")}</label>
                <input id="shop-location" className="field mt-1.5" value={form.physicalLocation} onChange={(event) => update("physicalLocation", event.target.value)} placeholder={tr("e.g. Kariakoo, Msimbazi St, opposite the bus stop", "mfano: Kariakoo, Mtaa wa Msimbazi, mkabala na kituo cha daladala")} maxLength={300} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="shop-description" className="label">{tr("What do you sell?", "Unauza nini?")}</label>
                <textarea id="shop-description" className="field mt-1.5 min-h-28" value={form.description} onChange={(event) => update("description", event.target.value)} placeholder={tr("Describe your products, prices and what makes your shop special.", "Elezea bidhaa zako, bei na kinachofanya duka lako kuwa la kipekee.")} maxLength={2000} />
                <p className="hint">{form.description.trim().length}/2000 · {tr("at least 20 characters", "angalau herufi 20")}</p>
              </div>
            </div>

            {registrationOpen ? (
              <p className="mt-5 rounded-xl bg-sand p-4 text-sm text-zinc-700">
                {tr("Registration fee:", "Ada ya usajili:")} <strong>{formatTZS(fee!)}</strong>.{" "}
                {tr("You'll see how to pay after sending this form. Your shop goes live after payment is confirmed.", "Utaona jinsi ya kulipa baada ya kutuma fomu hii. Duka litaonekana baada ya malipo kuthibitishwa.")}
              </p>
            ) : (
              <p className="alert-info mt-5">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                {tr(
                  "Shop registration opens soon. Please check back, or contact us to be notified.",
                  "Usajili wa maduka utafunguliwa hivi karibuni. Tafadhali rudi baadaye, au wasiliana nasi tukujulishe."
                )}
              </p>
            )}
            <button type="submit" disabled={submitting || !registrationOpen} className="btn-primary mt-5 w-full py-4 text-base">
              {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
              {submitting ? tr("Sending…", "Inatuma…") : tr("Send application", "Tuma ombi")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
