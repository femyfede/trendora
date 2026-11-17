"use client";

import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";
import { useStore } from "./store-context";
import { SITE } from "@/lib/constants";

export function Footer() {
  const { t, tr, language } = useStore();
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t("footer.shop"),
      links: [
        { href: "/shop", label: tr("All products", "Bidhaa zote") },
        { href: "/shop?category=Women", label: tr("Women", "Wanawake") },
        { href: "/shop?category=Men", label: tr("Men", "Wanaume") },
        { href: "/shop?sort=newest", label: tr("New arrivals", "Bidhaa mpya") },
        { href: "/shops", label: tr("Shops directory", "Orodha ya maduka") }
      ]
    },
    {
      title: t("footer.help"),
      links: [
        { href: "/about", label: t("nav.about") },
        { href: "/contact", label: t("nav.contact") },
        { href: "/create-shop", label: t("nav.addShop") },
        { href: "/account", label: t("nav.account") },
        { href: "/returns", label: t("footer.returns") }
      ]
    }
  ];

  return (
    <footer className="bg-brand-950 text-white">
      <div className="h-1 w-full bg-[linear-gradient(90deg,#C8623A_0_33%,#D99A21_33%_66%,#117585_66%)]" aria-hidden="true" />
      <div className="container-shell grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.2fr] lg:gap-12">
        <div>
          <Logo variant="light" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">{t("footer.about")}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/${SITE.phoneHref.replace("+", "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-white/40 hover:text-white"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              WhatsApp
            </a>
            <a
              href={`tel:${SITE.phoneHref}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-white/40 hover:text-white"
            >
              <Phone className="h-4 w-4 text-sun-400" />
              {tr("Call us", "Tupigie")}
            </a>
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">{column.title}</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/65">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">{t("footer.contact")}</h3>
          <ul className="mt-5 space-y-3 text-sm text-white/65">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sun-400" />
              <span>{SITE.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-sun-400" />
              <a href={`tel:${SITE.phoneHref}`} className="transition hover:text-white">
                {SITE.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-sun-400" />
              <a href={`mailto:${SITE.email}`} className="break-all transition hover:text-white">
                {SITE.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sun-400" />
              <span>{SITE.hours[language]}</span>
            </li>
          </ul>

          <h3 className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-white">{t("footer.newsletter")}</h3>
          <NewsletterForm variant="dark" className="mt-3" />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-shell flex flex-col gap-4 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. {t("footer.rights")}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition hover:text-white">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              {t("footer.terms")}
            </Link>
            <Link href="/returns" className="transition hover:text-white">
              {t("footer.returns")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
