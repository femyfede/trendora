import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { SITE } from "@/lib/constants";
import { getTranslator } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getTranslator();
  return {
    title: tr("Contact Us", "Wasiliana Nasi"),
    description: tr(
      "Call, WhatsApp or message TRENDORA for help with orders, delivery, returns or shop registration.",
      "Piga simu, tuma WhatsApp au ujumbe kwa TRENDORA kwa msaada kuhusu oda, usafirishaji, kurudisha bidhaa au usajili wa duka."
    )
  };
}

export default async function ContactPage() {
  const { tr, language } = await getTranslator();

  const faqs = [
    {
      q: tr("How long does delivery take?", "Usafirishaji unachukua muda gani?"),
      a: tr(
        "Dar es Salaam usually takes 1–2 days. Other regions take 2–6 days depending on the location.",
        "Dar es Salaam kwa kawaida ni siku 1–2. Mikoa mingine ni siku 2–6 kutegemea umbali."
      )
    },
    {
      q: tr("Can I pay with M-Pesa?", "Naweza kulipa kwa M-Pesa?"),
      a: tr(
        "Not yet. Right now you pay in cash when your order arrives. M-Pesa, Mixx by Yas and Airtel Money are coming soon.",
        "Bado. Kwa sasa unalipa pesa taslimu mzigo ukifika. M-Pesa, Mixx by Yas na Airtel Money zinakuja hivi karibuni."
      )
    },
    {
      q: tr("Can I return an item?", "Naweza kurudisha bidhaa?"),
      a: tr(
        "Yes, within 14 days of delivery, as long as it is unworn and still has its tags.",
        "Ndiyo, ndani ya siku 14 baada ya kupokea, ilimradi haijavaliwa na bado ina lebo zake."
      )
    },
    {
      q: tr("How do I register my shop?", "Nasajilije duka langu?"),
      a: tr(
        "Create an account, fill in the shop form, pay the registration fee and we verify your shop. It then appears in the shops directory.",
        "Fungua akaunti, jaza fomu ya duka, lipa ada ya usajili kisha tunathibitisha duka lako. Baada ya hapo litaonekana kwenye orodha ya maduka."
      )
    }
  ];

  const cards = [
    {
      href: `tel:${SITE.phoneHref}`,
      icon: Phone,
      label: tr("Call us", "Tupigie simu"),
      value: SITE.phone,
      note: SITE.hours[language]
    },
    {
      href: `https://wa.me/${SITE.phoneHref.replace("+", "")}`,
      icon: MessageCircle,
      label: "WhatsApp",
      value: SITE.whatsapp,
      note: tr("Quick replies during working hours", "Tunajibu haraka saa za kazi"),
      external: true
    },
    {
      href: `mailto:${SITE.email}`,
      icon: Mail,
      label: tr("Email", "Barua pepe"),
      value: SITE.email,
      note: tr("We reply within one working day", "Tunajibu ndani ya siku moja ya kazi")
    }
  ];

  return (
    <div>
      <section className="border-b border-zinc-200/70 bg-sand">
        <div className="container-shell py-10 sm:py-14">
          <p className="section-kicker">{tr("Contact Us", "Wasiliana Nasi")}</p>
          <h1 className="section-title mt-2">{tr("We're here to help.", "Tuko hapa kukusaidia.")}</h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-600">
            {tr(
              "Questions about an order, delivery, sizes or registering your shop? Talk to our team in Dar es Salaam.",
              "Una swali kuhusu oda, usafirishaji, saizi au kusajili duka lako? Ongea na timu yetu ya Dar es Salaam."
            )}
          </p>
        </div>
      </section>

      <div className="container-shell grid gap-8 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:py-14">
        <div className="space-y-3">
          {cards.map(({ href, icon: Icon, label, value, note, external }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50/40"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
                <span className="mt-0.5 block break-all text-base font-semibold text-ink">{value}</span>
                <span className="block text-sm text-zinc-600">{note}</span>
              </span>
            </a>
          ))}
          <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
              <MapPin className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">{tr("Office", "Ofisi")}</span>
              <span className="mt-0.5 block text-base font-semibold text-ink">{SITE.address}</span>
              <span className="block text-sm text-zinc-600">{tr("Visits by appointment", "Kwa miadi tu")}</span>
            </span>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
              <Clock className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">{tr("Working hours", "Saa za kazi")}</span>
              <span className="mt-0.5 block text-base font-semibold text-ink">{SITE.hours[language]}</span>
            </span>
          </div>
          <p className="rounded-2xl bg-brand-50/70 p-4 text-sm leading-relaxed text-zinc-700">
            {tr(
              "Asking about an order? Include your order number (e.g. TRD-ABC123) so we can help faster.",
              "Unauliza kuhusu oda? Weka namba ya oda yako (mfano TRD-ABC123) ili tukusaidie haraka."
            )}{" "}
            <Link href="/returns" className="font-semibold text-brand-700 underline">
              {tr("Returns policy", "Sera ya kurudisha bidhaa")}
            </Link>
          </p>
        </div>

        <div>
          <ContactForm />

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
            <h2 className="font-display text-lg font-extrabold">{tr("Frequently asked questions", "Maswali yanayoulizwa mara kwa mara")}</h2>
            <div className="mt-3 divide-y divide-zinc-100">
              {faqs.map((item) => (
                <details key={item.q} className="group py-1">
                  <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink">
                    {item.q}
                    <span className="text-lg text-brand-700 transition group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="pb-3 text-sm leading-relaxed text-zinc-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
