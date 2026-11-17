"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  LogOut,
  Package,
  ShoppingBag,
  Store,
  User as UserIcon
} from "lucide-react";
import { useStore } from "@/components/store-context";
import { IMAGES, ORDER_STATUS_LABELS, SHOP_STATUS_LABELS } from "@/lib/constants";
import { cn, formatDate, formatTZS, isValidEmail } from "@/lib/utils";

type Order = {
  id: string;
  items: { name: string; qty: number; price: number; productId: string; size: string; color: string }[];
  total: number;
  status: keyof typeof ORDER_STATUS_LABELS;
  createdAt: string;
};

type ShopApplicationSummary = { id: string; shopName: string; status: string };

const STATUS_TONE: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
  shipped: "bg-blue-50 text-blue-700",
  processing: "bg-sun-100 text-amber-800",
  pending: "bg-sun-100 text-amber-800"
};

export function AccountClient() {
  const { toast, tr, t, language, user, userLoaded, refreshUser, setUser } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersFailed, setOrdersFailed] = useState(false);
  const [application, setApplication] = useState<ShopApplicationSummary | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

  const userId = user?.id;

  // /account?mode=register opens straight on the sign-up tab.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("mode") === "register") setMode("register");
  }, []);

  const loadAccountData = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersFailed(false);
    try {
      const [ordersResponse, shopResponse] = await Promise.all([
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/shop-applications", { cache: "no-store" })
      ]);
      if (!ordersResponse.ok) throw new Error("orders");
      const ordersData = await ordersResponse.json();
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      if (shopResponse.ok) {
        const shopData = await shopResponse.json();
        setApplication(Array.isArray(shopData.applications) ? shopData.applications[0] ?? null : null);
      }
    } catch {
      setOrdersFailed(true);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Runs once per signed-in user (the old version re-ran on every render).
  useEffect(() => {
    if (userId) loadAccountData();
  }, [userId, loadAccountData]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError("");

    if (mode === "register" && name.trim().length < 2) return setError(tr("Enter your full name.", "Weka jina lako kamili."));
    if (!isValidEmail(email)) return setError(tr("Enter a valid email address.", "Weka barua pepe sahihi."));
    if (mode === "register" && password.length < 8)
      return setError(tr("Password must be at least 8 characters.", "Nenosiri liwe na herufi 8 au zaidi."));
    if (mode === "login" && !password) return setError(tr("Enter your password.", "Weka nenosiri lako."));

    setSubmitting(true);
    try {
      const response = await fetch(mode === "register" ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "register" ? { name, email, password } : { email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("common.error"));
      await refreshUser();
      setPassword("");
      toast(
        mode === "register"
          ? tr(`Welcome, ${name.split(" ")[0]}! Your account is ready.`, `Karibu, ${name.split(" ")[0]}! Akaunti yako iko tayari.`)
          : tr("Welcome back!", "Karibu tena!")
      );
      // Return the visitor to where they were going (e.g. shop registration).
      const next = new URLSearchParams(window.location.search).get("next");
      if (next && next.startsWith("/") && !next.startsWith("//")) window.location.assign(next);
    } catch (caught) {
      setError(caught instanceof TypeError ? t("common.network") : caught instanceof Error ? caught.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setOrders([]);
      setApplication(null);
      setMode("login");
      toast(tr("You have logged out.", "Umetoka kwenye akaunti."), "info");
    }
  };

  if (!userLoaded) {
    return (
      <div className="container-shell flex items-center justify-center py-28 text-sm text-zinc-500" aria-busy="true">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-700" />
        {t("common.loading")}
      </div>
    );
  }

  if (user) {
    const statusLabel = (status: string) =>
      ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS]?.[language] ?? status;

    return (
      <div className="container-shell py-8 lg:py-14">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-700 font-display text-xl font-extrabold text-white">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <p className="text-sm text-zinc-500">{tr("Hello,", "Habari,")}</p>
                <h1 className="font-display text-2xl font-extrabold tracking-tight">{user.name}</h1>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-red-300 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              {tr("Log out", "Toka")}
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link href="/shop" className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-brand-300">
              <ShoppingBag className="h-5 w-5 text-brand-700" />
              <span className="flex-1 text-sm font-semibold">{t("cart.continue")}</span>
              <ArrowRight className="h-4 w-4 text-zinc-400" />
            </Link>
            <Link href="/wishlist" className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-brand-300">
              <Heart className="h-5 w-5 text-brand-700" />
              <span className="flex-1 text-sm font-semibold">{t("nav.wishlist")}</span>
              <ArrowRight className="h-4 w-4 text-zinc-400" />
            </Link>
            <Link href="/create-shop" className="flex items-center gap-3 rounded-2xl border border-clay-200 bg-clay-50 p-4 transition hover:border-clay-500">
              <Store className="h-5 w-5 text-clay-600" />
              <span className="flex-1">
                <span className="block text-sm font-semibold">
                  {application ? tr("My shop", "Duka langu") : t("nav.addShop")}
                </span>
                {application && (
                  <span className="block text-xs text-clay-700">
                    {SHOP_STATUS_LABELS[application.status]?.[language] ?? application.status}
                  </span>
                )}
              </span>
              <ArrowRight className="h-4 w-4 text-zinc-400" />
            </Link>
          </div>

          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white">
            <div role="tablist" aria-label={t("nav.account")} className="flex gap-1 border-b border-zinc-100 p-2">
              {(
                [
                  { id: "orders", label: tr("My orders", "Oda zangu"), icon: Package },
                  { id: "profile", label: tr("My details", "Taarifa zangu"), icon: UserIcon }
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                      activeTab === tab.id ? "bg-brand-50 text-brand-700" : "text-zinc-600 hover:bg-zinc-50 hover:text-ink"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {tab.id === "orders" && orders.length > 0 && (
                      <span className="rounded-full bg-white px-1.5 text-[11px] font-bold">{orders.length}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-5 sm:p-6" role="tabpanel">
              {activeTab === "orders" &&
                (ordersLoading ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-700" />
                    {t("common.loading")}
                  </div>
                ) : ordersFailed ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-zinc-600">{t("common.network")}</p>
                    <button type="button" onClick={loadAccountData} className="btn-outline mt-4">
                      {t("common.tryAgain")}
                    </button>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package className="mx-auto h-10 w-10 text-zinc-300" />
                    <p className="mt-3 text-base font-semibold text-ink">{tr("No orders yet", "Bado hujaweka oda")}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {tr("Orders you place while logged in will appear here.", "Oda utakazoweka ukiwa umeingia zitaonekana hapa.")}
                    </p>
                    <Link href="/shop" className="btn-primary mt-5">
                      {tr("Start shopping", "Anza kununua")}
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {orders.map((order) => (
                      <li key={order.id} className="rounded-xl border border-zinc-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-display text-sm font-extrabold text-ink">{order.id}</p>
                            <p className="text-xs text-zinc-500">
                              {formatDate(order.createdAt, language)} ·{" "}
                              {tr(
                                `${order.items.reduce((sum, item) => sum + item.qty, 0)} items`,
                                `bidhaa ${order.items.reduce((sum, item) => sum + item.qty, 0)}`
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", STATUS_TONE[order.status] ?? "bg-zinc-100")}>
                              {statusLabel(order.status)}
                            </span>
                            <p className="font-display text-sm font-extrabold">{formatTZS(order.total)}</p>
                          </div>
                        </div>
                        <p className="mt-2 line-clamp-1 text-sm text-zinc-600">
                          {order.items.map((item) => `${item.name} ×${item.qty}`).join(", ")}
                        </p>
                        <Link
                          href={`/order/${encodeURIComponent(order.id)}`}
                          className="mt-2 inline-flex items-center gap-1 py-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
                        >
                          {tr("View order", "Tazama oda")} <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ))}

              {activeTab === "profile" && (
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <div className="rounded-xl bg-sand p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{tr("Name", "Jina")}</dt>
                    <dd className="mt-1 font-medium text-ink">{user.name}</dd>
                  </div>
                  <div className="rounded-xl bg-sand p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{tr("Email", "Barua pepe")}</dt>
                    <dd className="mt-1 break-all font-medium text-ink">{user.email}</dd>
                  </div>
                  {user.createdAt && (
                    <div className="rounded-xl bg-sand p-4">
                      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{tr("Member since", "Mwanachama tangu")}</dt>
                      <dd className="mt-1 font-medium text-ink">{formatDate(user.createdAt, language)}</dd>
                    </div>
                  )}
                  <div className="rounded-xl bg-sand p-4 sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{tr("Need to change something?", "Unahitaji kubadilisha kitu?")}</dt>
                    <dd className="mt-1 text-zinc-700">
                      {tr("Contact us and we will update your details.", "Wasiliana nasi tutabadilisha taarifa zako.")}{" "}
                      <Link href="/contact" className="font-semibold text-brand-700 underline">
                        {t("nav.contact")}
                      </Link>
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setError("");
  };

  return (
    <div className="container-shell py-8 lg:py-14">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-zinc-200 bg-white lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden min-h-[520px] lg:block">
          <Image
            src={IMAGES.market}
            alt={tr("A busy market in Tanzania", "Soko lenye shughuli nyingi Tanzania")}
            fill
            sizes="420px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-white">
            <h2 className="font-display text-2xl font-extrabold leading-tight">
              {tr("One account for shopping and selling.", "Akaunti moja kwa kununua na kuuza.")}
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-white/85">
              <li>✓ {tr("Track your orders", "Fuatilia oda zako")}</li>
              <li>✓ {tr("Register and manage your shop", "Sajili na simamia duka lako")}</li>
              <li>✓ {tr("Write product reviews", "Andika maoni kuhusu bidhaa")}</li>
            </ul>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div role="tablist" className="flex rounded-full bg-smoke p-1">
            {(["login", "register"] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={mode === item}
                onClick={() => switchMode(item)}
                className={cn(
                  "flex-1 rounded-full py-3 text-sm font-semibold transition",
                  mode === item ? "bg-white text-ink shadow-sm" : "text-zinc-600 hover:text-ink"
                )}
              >
                {item === "login" ? t("nav.login") : t("nav.register")}
              </button>
            ))}
          </div>

          <div className="mt-7">
            <h1 className="font-display text-2xl font-extrabold tracking-tight">
              {mode === "login" ? tr("Welcome back", "Karibu tena") : tr("Create your account", "Fungua akaunti yako")}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              {mode === "login"
                ? tr("Log in with your email and password.", "Ingia kwa barua pepe na nenosiri lako.")
                : tr("It takes less than a minute and it's free.", "Inachukua chini ya dakika moja, na ni bure.")}
            </p>
          </div>

          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            {mode === "register" && (
              <div>
                <label htmlFor="account-name" className="label">
                  {tr("Full name", "Jina kamili")}
                </label>
                <input
                  id="account-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="field mt-1.5"
                  autoComplete="name"
                  placeholder={tr("e.g. Neema Mushi", "mfano: Neema Mushi")}
                  maxLength={100}
                />
              </div>
            )}
            <div>
              <label htmlFor="account-email" className="label">
                {tr("Email", "Barua pepe")}
              </label>
              <input
                id="account-email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field mt-1.5"
                autoComplete="email"
                placeholder="jina@mfano.com"
                maxLength={200}
              />
            </div>
            <div>
              <label htmlFor="account-password" className="label">
                {tr("Password", "Nenosiri")}
              </label>
              <div className="relative mt-1.5">
                <input
                  id="account-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="field pr-12"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  maxLength={200}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-zinc-500 hover:text-ink"
                  aria-label={showPassword ? tr("Hide password", "Ficha nenosiri") : tr("Show password", "Onyesha nenosiri")}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {mode === "register" && <p className="hint">{tr("At least 8 characters.", "Angalau herufi 8.")}</p>}
            </div>

            {error && (
              <p role="alert" className="alert-error">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-base">
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("common.wait")}
                </>
              ) : mode === "login" ? (
                t("nav.login")
              ) : (
                tr("Create account", "Fungua akaunti")
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-zinc-600">
            {mode === "login" ? tr("New here?", "Mgeni hapa?") : tr("Already have an account?", "Tayari una akaunti?")}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="font-semibold text-brand-700 underline"
            >
              {mode === "login" ? tr("Create an account", "Fungua akaunti") : t("nav.login")}
            </button>
          </p>

          <p className="mt-4 text-center text-xs leading-relaxed text-zinc-500">
            {tr("By continuing you agree to our", "Kwa kuendelea unakubali")}{" "}
            <Link href="/terms" className="underline">
              {t("footer.terms")}
            </Link>{" "}
            {tr("and", "na")}{" "}
            <Link href="/privacy" className="underline">
              {t("footer.privacy")}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
