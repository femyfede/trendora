"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { isValidEmail } from "@/lib/utils";
import { useStore } from "./store-context";

export function ContactForm() {
  const { tr, t, user } = useStore();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Pre-fill once for signed-in customers; they can still edit or clear the fields.
  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      name: current.name || user.name,
      email: current.email || user.email
    }));
  }, [user]);

  const update = (key: keyof typeof form, next: string) => setForm((current) => ({ ...current, [key]: next }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "loading") return;
    const payload = form;
    if (payload.name.trim().length < 2) {
      setStatus("error");
      setMessage(tr("Enter your name.", "Weka jina lako."));
      return;
    }
    if (!isValidEmail(payload.email)) {
      setStatus("error");
      setMessage(tr("Enter a valid email address.", "Weka barua pepe sahihi."));
      return;
    }
    if (payload.message.trim().length < 10) {
      setStatus("error");
      setMessage(tr("Your message should be at least 10 characters.", "Ujumbe wako uwe na angalau herufi 10."));
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("common.error"));
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (caught) {
      setStatus("error");
      setMessage(caught instanceof TypeError ? t("common.network") : caught instanceof Error ? caught.message : t("common.error"));
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50/70 px-6 py-12 text-center" role="status">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-emerald-600 shadow-sm">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-display text-xl font-extrabold text-ink">{tr("Message sent", "Ujumbe umetumwa")}</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-700">
          {tr(
            "Thank you! Our team usually replies within one working day.",
            "Asante! Timu yetu kwa kawaida hujibu ndani ya siku moja ya kazi."
          )}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 px-3 py-2 text-sm font-semibold text-brand-700 hover:underline"
        >
          {tr("Send another message", "Tuma ujumbe mwingine")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
      <h2 className="font-display text-xl font-extrabold">{tr("Send us a message", "Tutumie ujumbe")}</h2>
      <p className="mt-1 text-sm text-zinc-600">
        {tr("We'll reply by email.", "Tutakujibu kwa barua pepe.")}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="label">{tr("Your name", "Jina lako")}</label>
          <input id="contact-name" value={form.name} onChange={(event) => update("name", event.target.value)} className="field mt-1.5" autoComplete="name" maxLength={100} />
        </div>
        <div>
          <label htmlFor="contact-email" className="label">{tr("Email", "Barua pepe")}</label>
          <input id="contact-email" type="email" inputMode="email" value={form.email} onChange={(event) => update("email", event.target.value)} className="field mt-1.5" autoComplete="email" maxLength={200} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contact-subject" className="label">
            {tr("Subject", "Kuhusu")} <span className="font-normal text-zinc-500">({tr("optional", "si lazima")})</span>
          </label>
          <input
            id="contact-subject"
            value={form.subject}
            onChange={(event) => update("subject", event.target.value)}
            className="field mt-1.5"
            placeholder={tr("Order, delivery, returns or my shop", "Oda, usafirishaji, kurudisha au duka langu")}
            maxLength={150}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contact-message" className="label">{tr("Message", "Ujumbe")}</label>
          <textarea
            id="contact-message"
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            rows={5}
            className="field mt-1.5 resize-y"
            placeholder={tr("How can we help?", "Tukusaidie nini?")}
            maxLength={3000}
          />
        </div>
      </div>

      {status === "error" && (
        <p role="alert" className="alert-error mt-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </p>
      )}

      <button type="submit" disabled={status === "loading"} className="btn-primary mt-5 w-full sm:w-auto">
        {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {status === "loading" ? tr("Sending…", "Inatuma…") : tr("Send message", "Tuma ujumbe")}
      </button>
      <p className="mt-3 text-xs text-zinc-500">
        {tr("We only use your details to reply to you.", "Tunatumia taarifa zako kukujibu tu.")}
      </p>
    </form>
  );
}
