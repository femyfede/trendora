import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact TRENDORA for order help, delivery questions, returns or styling advice. Based in Dar es Salaam, Tanzania."
};

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Dar es Salaam is usually 1–2 business days. Other Tanzanian regions take 2–6 business days depending on location."
  },
  {
    q: "Can I pay with mobile money?",
    a: "Not yet. M-Pesa, Mixx by Yas and Airtel Money integrations are still pending. Cash on Delivery is available now."
  },
  {
    q: "What is your returns window?",
    a: "You have 14 days from delivery to request a return. Pieces must be unworn, unwashed and have their original tags."
  },
  {
    q: "Where is your studio?",
    a: "Our studio is on the Msasani Peninsula in Dar es Salaam. Visits are by appointment — call or email first."
  }
];

export default function ContactPage() {
  return (
    <div>
      <section className="border-b border-zinc-200/70 bg-[#F7F8F7]">
        <div className="container-shell py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="text-[11px] text-zinc-500">
            <Link href="/" className="hover:text-brand-700">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <span className="font-medium text-ink">Contact</span>
          </nav>
          <h1 className="section-title mt-4">We&apos;re here to help.</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
            Questions about an order, delivery, sizing or returns? Our Dar es
            Salaam team is available Monday to Saturday, 9:00 – 19:00 EAT.
          </p>
        </div>
      </section>

      <div className="container-shell grid gap-8 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:py-14">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <a
              href={`tel:${SITE.phoneHref}`}
              className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50/30"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                  Call us
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{SITE.phone}</p>
                <p className="text-[10px] text-zinc-500">Mon – Sat, 9:00 – 19:00</p>
              </div>
            </a>

            <a
              href={`https://wa.me/${SITE.phoneHref.replace("+", "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50/30"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                  WhatsApp
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{SITE.whatsapp}</p>
                <p className="text-[10px] text-zinc-500">Fast replies during business hours</p>
              </div>
            </a>

            <a
              href={`mailto:${SITE.email}`}
              className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50/30"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                  Email
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{SITE.email}</p>
                <p className="text-[10px] text-zinc-500">Replies within one business day</p>
              </div>
            </a>

            <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                  Studio
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink">Msasani Peninsula</p>
                <p className="text-[10px] text-zinc-500">{SITE.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                  Opening hours
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{SITE.hours}</p>
                <p className="text-[10px] text-zinc-500">Studio visits by appointment</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
            <h2 className="font-display text-sm font-extrabold text-ink">
              Order enquiries
            </h2>
            <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-600">
              For faster help, include your TRENDORA order number, the email you
              used, and a short description of the issue. We can also be reached on
              WhatsApp during business hours.
            </p>
            <Link
              href="/returns"
              className="mt-2 inline-block text-[11px] font-semibold text-brand-700 hover:underline"
            >
              Read the returns policy →
            </Link>
          </div>
        </div>

        <div>
          <ContactForm />

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
            <h2 className="font-display text-lg font-extrabold">
              Frequently asked questions
            </h2>
            <div className="mt-4 divide-y divide-zinc-100">
              {FAQS.map((item) => (
                <details key={item.q} className="group py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold text-ink">
                    {item.q}
                    <span className="text-brand-700 transition group-open:rotate-45">＋</span>
                  </summary>
                  <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
