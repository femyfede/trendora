"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Facebook,
  Heart,
  Instagram,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  Youtube,
  Phone,
  Globe2
} from "lucide-react";
import { Logo } from "./logo";
import { SearchOverlay } from "./search-overlay";
import { useStore } from "./store-context";
import { CURRENCIES, LANGUAGES, SITE } from "@/lib/constants";
import type { Currency, Language } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV = [
  { key: "nav.home" as const, href: "/" },
  { key: "nav.shop" as const, href: "/shop" },
  { key: "nav.shops" as const, href: "/shops" },
  { key: "nav.men" as const, href: "/shop?category=Men" },
  { key: "nav.women" as const, href: "/shop?category=Women" },
  { key: "nav.new" as const, href: "/shop?sort=newest" },
  { key: "nav.collections" as const, href: "/collections" },
  { key: "nav.contact" as const, href: "/contact" }
];

function CountBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-brand-700 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const { cartCount, wishlistCount, hydrated, t, currency, language, setCurrency, setLanguage } =
    useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-zinc-200/70 bg-white/95 backdrop-blur-md transition-shadow duration-300",
          scrolled && "shadow-[0_10px_30px_-24px_rgba(6,39,46,0.5)]"
        )}
      >
        <div className="container-shell flex h-[68px] items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-full p-2 text-ink transition hover:bg-zinc-100 lg:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo className="shrink-0" />
          </div>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-6 lg:flex xl:gap-8"
          >
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="nav-link whitespace-nowrap"
                  data-active={active}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <Link
              href="/create-shop"
              className="hidden whitespace-nowrap rounded-full bg-brand-700 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-brand-800 lg:inline-flex"
            >
              Fungua duka lako
            </Link>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2.5 text-ink transition hover:bg-zinc-100"
              aria-label="Search"
            >
              <Search className="h-[19px] w-[19px]" />
            </button>
            <Link
              href="/account"
              className="hidden rounded-full p-2.5 text-ink transition hover:bg-zinc-100 sm:block"
              aria-label="Account"
            >
              <User className="h-[19px] w-[19px]" />
            </Link>
            <Link
              href="/wishlist"
              className="relative rounded-full p-2.5 text-ink transition hover:bg-zinc-100"
              aria-label={`Wishlist${hydrated && wishlistCount ? ` (${wishlistCount})` : ""}`}
            >
              <Heart className="h-[19px] w-[19px]" />
              {hydrated && <CountBadge count={wishlistCount} />}
            </Link>
            <Link
              href="/cart"
              className="relative rounded-full p-2.5 text-ink transition hover:bg-zinc-100"
              aria-label={`Cart${hydrated && cartCount ? ` (${cartCount})` : ""}`}
            >
              <ShoppingBag className="h-[19px] w-[19px]" />
              {hydrated && <CountBadge count={cartCount} />}
            </Link>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {menuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="mobile-menu"
            className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-white shadow-lift animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-ink"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-5 py-4">
              {NAV.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex items-center justify-between border-b border-zinc-100 py-4 font-display text-lg font-bold text-ink transition hover:text-brand-700"
                >
                  {t(item.key)}
                  <span className="text-zinc-300">→</span>
                </Link>
              ))}
              <Link
                href="/create-shop"
                className="mt-5 flex items-center justify-between rounded-xl bg-brand-700 px-4 py-3.5 font-semibold text-white"
              >
                Fungua Duka Lako
                <span>→</span>
              </Link>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link
                  href="/account"
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-3 text-sm font-semibold text-ink"
                >
                  <User className="h-4 w-4 text-brand-700" /> Account
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-3 text-sm font-semibold text-ink"
                >
                  <Heart className="h-4 w-4 text-brand-700" /> Wishlist
                </Link>
              </div>
            </nav>

            <div className="border-t border-zinc-100 bg-smoke/60 px-5 py-4">
              <div className="flex items-center gap-3">
                <Globe2 className="h-4 w-4 text-zinc-400" />
                <select
                  aria-label="Currency"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value as Currency)}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium"
                >
                  {CURRENCIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Language"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as Language)}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium"
                >
                  {LANGUAGES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <a
                href={`tel:${SITE.phoneHref}`}
                className="mt-3 flex items-center gap-2 text-xs font-medium text-zinc-500"
              >
                <Phone className="h-3.5 w-3.5 text-brand-700" />
                {SITE.phone}
              </a>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="text-zinc-400 hover:text-brand-700"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="text-zinc-400 hover:text-brand-700"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="text-zinc-400 hover:text-brand-700"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
