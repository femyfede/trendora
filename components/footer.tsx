"use client";

import Link from "next/link";
import {
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube
} from "lucide-react";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";
import { useStore } from "./store-context";
import { SITE } from "@/lib/constants";

export function Footer() {
  const { t } = useStore();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#07181C] text-white">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.1fr] lg:gap-12">
        <div>
          <Logo variant="light" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
            {t("footer.about")}
          </p>
          <div className="mt-6 flex items-center gap-2.5">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="TRENDORA on Instagram"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:bg-white/5 hover:text-white"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="TRENDORA on Facebook"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:bg-white/5 hover:text-white"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="TRENDORA on YouTube"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:bg-white/5 hover:text-white"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-1.5">
            {["M-Pesa", "Mixx by Yas", "Airtel Money"].map((item) => (
              <span
                key={item}
                className="rounded border border-white/15 px-2 py-1 text-[10px] font-medium text-white/60"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-white/35">
            Mobile money payments are not active yet — integrations are pending.
          </p>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
            {t("footer.shop")}
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-white/55">
            <li>
              <Link href="/shop" className="transition hover:text-white">
                All products
              </Link>
            </li>
            <li>
              <Link
                href="/shop?category=Women"
                className="transition hover:text-white"
              >
                Women
              </Link>
            </li>
            <li>
              <Link
                href="/shop?category=Men"
                className="transition hover:text-white"
              >
                Men
              </Link>
            </li>
            <li>
              <Link
                href="/shop?category=Dresses"
                className="transition hover:text-white"
              >
                Dresses
              </Link>
            </li>
            <li>
              <Link href="/shop?sort=newest" className="transition hover:text-white">
                New arrivals
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
            {t("footer.help")}
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-white/55">
            <li>
              <Link href="/contact" className="transition hover:text-white">
                Contact us
              </Link>
            </li>
            <li>
              <Link href="/returns" className="transition hover:text-white">
                Returns & exchanges
              </Link>
            </li>
            <li>
              <Link href="/account" className="transition hover:text-white">
                My account
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="transition hover:text-white">
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/shop" className="transition hover:text-white">
                Size guide
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
            {t("footer.contact")}
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-white/55">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
              <span>{SITE.address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-brand-300" />
              <a href={`tel:${SITE.phoneHref}`} className="transition hover:text-white">
                {SITE.phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-brand-300" />
              <a href={`mailto:${SITE.email}`} className="transition hover:text-white">
                {SITE.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-brand-300" />
              <span>{SITE.hours}</span>
            </li>
          </ul>

          <h3 className="mt-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
            {t("footer.newsletter")}
          </h3>
          <NewsletterForm variant="dark" className="mt-3" />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-shell flex flex-col gap-4 py-6 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
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
            <span className="text-white/25">TZS · Tanzania</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
