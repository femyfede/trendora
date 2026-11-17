"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Heart,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  Store,
  User,
  X
} from "lucide-react";
import { Logo } from "./logo";
import { SearchOverlay } from "./search-overlay";
import { useStore } from "./store-context";
import { LanguageSwitch } from "./language-switch";
import { CURRENCIES, SITE } from "@/lib/constants";
import type { Currency } from "@/lib/types";
import { cn } from "@/lib/utils";

export const NAV = [
  { key: "nav.home" as const, href: "/" },
  { key: "nav.shop" as const, href: "/shop" },
  { key: "nav.shops" as const, href: "/shops" },
  { key: "nav.collections" as const, href: "/collections" },
  { key: "nav.about" as const, href: "/about" },
  { key: "nav.contact" as const, href: "/contact" }
];

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function CountBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-clay-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const { cartCount, wishlistCount, hydrated, t, tr, currency, setCurrency, user } = useStore();
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

  // The mobile bottom bar opens search through this event.
  useEffect(() => {
    const open = () => setSearchOpen(true);
    window.addEventListener("trendora:open-search", open);
    return () => window.removeEventListener("trendora:open-search", open);
  }, []);

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

  const accountLabel = user ? t("nav.account") : t("nav.login");

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-zinc-200/70 bg-white/95 backdrop-blur-md transition-shadow duration-300",
          scrolled && "shadow-[0_10px_30px_-24px_rgba(6,39,46,0.5)]"
        )}
      >
        <div className="container-shell flex h-16 items-center justify-between gap-3 lg:h-[72px]">
          <div className="flex min-w-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="-ml-2 rounded-full p-2.5 text-ink transition hover:bg-zinc-100 lg:hidden"
              aria-label={tr("Open menu", "Fungua menyu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo className="shrink-0" />
          </div>

          <nav aria-label={tr("Main navigation", "Menyu kuu")} className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="nav-link whitespace-nowrap"
                data-active={isActivePath(pathname, item.href)}
                aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden rounded-full p-2.5 text-ink transition hover:bg-zinc-100 sm:block"
              aria-label={t("nav.search")}
            >
              <Search className="h-5 w-5" />
            </button>
            <LanguageSwitch className="mx-1 lg:hidden" />
            <Link
              href="/account"
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-ink transition hover:bg-zinc-100 lg:inline-flex"
            >
              <User className="h-5 w-5" />
              <span className="max-w-[120px] truncate">{user ? user.name.split(" ")[0] : accountLabel}</span>
            </Link>
            <Link
              href="/wishlist"
              className="relative hidden rounded-full p-2.5 text-ink transition hover:bg-zinc-100 sm:block"
              aria-label={`${t("nav.wishlist")}${hydrated && wishlistCount ? ` (${wishlistCount})` : ""}`}
            >
              <Heart className="h-5 w-5" />
              {hydrated && <CountBadge count={wishlistCount} />}
            </Link>
            <Link
              href="/cart"
              className="relative rounded-full p-2.5 text-ink transition hover:bg-zinc-100"
              aria-label={`${t("nav.cart")}${hydrated && cartCount ? ` (${cartCount})` : ""}`}
            >
              <ShoppingBag className="h-5 w-5" />
              {hydrated && <CountBadge count={cartCount} />}
            </Link>
            <Link
              href="/create-shop"
              className="ml-2 hidden items-center gap-2 whitespace-nowrap rounded-full bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 xl:inline-flex"
            >
              <Store className="h-4 w-4" />
              {t("nav.addShop")}
            </Link>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {menuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label={tr("Close menu", "Funga menyu")}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t("common.menu")}
            className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-lift animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-ink"
                aria-label={tr("Close menu", "Funga menyu")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label={tr("Mobile navigation", "Menyu ya simu")} className="flex-1 overflow-y-auto px-5 py-3">
              {NAV.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between border-b border-zinc-100 py-4 text-base font-semibold transition hover:text-brand-700",
                    isActivePath(pathname, item.href) ? "text-brand-700" : "text-ink"
                  )}
                >
                  {t(item.key)}
                  <ChevronRight className="h-4 w-4 text-zinc-300" />
                </Link>
              ))}

              <Link
                href="/create-shop"
                className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-700 px-4 py-4 text-white"
              >
                <Store className="h-5 w-5 shrink-0" />
                <span className="flex-1">
                  <span className="block font-semibold">{t("nav.addShop")}</span>
                  <span className="block text-xs text-white/75">
                    {tr("Reach customers across Tanzania", "Wafikie wateja kote Tanzania")}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4" />
              </Link>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/account"
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-3 text-sm font-semibold text-ink"
                >
                  <User className="h-4 w-4 text-brand-700" /> {accountLabel}
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-3 text-sm font-semibold text-ink"
                >
                  <Heart className="h-4 w-4 text-brand-700" /> {t("nav.wishlist")}
                </Link>
              </div>
            </nav>

            <div className="space-y-3 border-t border-zinc-100 bg-sand px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-zinc-600">{tr("Language", "Lugha")}</span>
                <LanguageSwitch />
              </div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="menu-currency" className="text-sm font-medium text-zinc-600">
                  {tr("Show prices in", "Onyesha bei kwa")}
                </label>
                <select
                  id="menu-currency"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value as Currency)}
                  className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm font-medium"
                >
                  {CURRENCIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <a
                  href={`tel:${SITE.phoneHref}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-semibold text-ink"
                >
                  <Phone className="h-4 w-4 text-brand-700" />
                  {tr("Call", "Piga simu")}
                </a>
                <a
                  href={`https://wa.me/${SITE.phoneHref.replace("+", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-2.5 text-sm font-semibold text-ink"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
