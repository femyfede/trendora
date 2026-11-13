"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not send message.");
      setStatus("success");
      setMessage(
        "Your message has been received. Our team usually replies within one business day."
      );
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (caught) {
      setStatus("error");
      setMessage(caught instanceof Error ? caught.message : "Could not send message.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50/70 px-6 py-12 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-emerald-600 shadow-sm">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-display text-xl font-extrabold text-ink">
          Message sent
        </h2>
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-zinc-600">{message}</p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setMessage("");
          }}
          className="mt-5 text-xs font-semibold text-brand-700 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7"
    >
      <h2 className="font-display text-xl font-extrabold">Send us a message</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Tell us how we can help and we&apos;ll get back to you by email.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="text-[11px] font-semibold text-zinc-700">
            Your name
          </label>
          <input
            id="contact-name"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className="field mt-1.5"
            autoComplete="name"
            required
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="text-[11px] font-semibold text-zinc-700">
            Email address
          </label>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            className="field mt-1.5"
            autoComplete="email"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contact-subject" className="text-[11px] font-semibold text-zinc-700">
            Subject
          </label>
          <input
            id="contact-subject"
            value={form.subject}
            onChange={(event) => update("subject", event.target.value)}
            className="field mt-1.5"
            placeholder="Order, delivery, returns or styling"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contact-message" className="text-[11px] font-semibold text-zinc-700">
            Message
          </label>
          <textarea
            id="contact-message"
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            rows={5}
            className="field mt-1.5 resize-y"
            placeholder="Include your order number if your question is about an existing order."
            required
          />
        </div>
      </div>

      {status === "error" && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-medium text-red-600">
          {message}
        </p>
      )}

      <button type="submit" disabled={status === "loading"} className="btn-primary mt-4">
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Send message
      </button>
      <p className="mt-2 text-[10px] text-zinc-400">
        We use your details only to respond to this enquiry.
      </p>
    </form>
  );
}
