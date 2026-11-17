"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, Store, User } from "lucide-react";
import { useStore } from "./store-context";
import { isActivePath } from "./header";
import { cn } from "@/lib/utils";

/** Bottom tab bar for phones: the five things people do most, always one thumb away. */
export function MobileNav() {
  const pathname = usePathname();
  const { t, cartCount, hydrated, user } = useStore();

  if (pathname.startsWith("/admin")) return null;

  const items = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/shops", label: t("nav.shops"), icon: Store },
    { href: "#search", label: t("nav.search"), icon: Search },
    { href: "/cart", label: t("nav.cart"), icon: ShoppingBag, badge: hydrated ? cartCount : 0 },
    { href: "/account", label: user ? t("nav.account") : t("nav.login"), icon: User }
  ];

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-zinc-200 bg-white/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href !== "#search" && isActivePath(pathname, item.href);
          const content = (
            <>
              <span className="relative">
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.3 : 1.8} />
                {item.badge ? (
                  <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-clay-500 px-1 text-[10px] font-bold leading-none text-white">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </span>
              <span className="mt-1 max-w-full truncate text-[11px] font-semibold leading-none">{item.label}</span>
            </>
          );
          const className = cn(
            "flex h-full w-full flex-col items-center justify-center px-1 transition",
            active ? "text-brand-700" : "text-zinc-500 hover:text-ink"
          );
          return (
            <li key={item.href}>
              {item.href === "#search" ? (
                <button
                  type="button"
                  className={className}
                  onClick={() => window.dispatchEvent(new Event("trendora:open-search"))}
                >
                  {content}
                </button>
              ) : (
                <Link href={item.href} className={className} aria-current={active ? "page" : undefined}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
