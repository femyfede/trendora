"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  Loader2,
  Lock,
  LogOut,
  Package,
  ShieldCheck,
  User as UserIcon
} from "lucide-react";
import { useStore } from "@/components/store-context";
import { SITE } from "@/lib/constants";
import { cn, formatDate, formatTZS } from "@/lib/utils";

type AccountUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
};

type Order = {
  id: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: string;
  createdAt: string;
};

export function AccountClient() {
  const { toast } = useStore();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "settings">("overview");

  const loadUser = async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await response.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const response = await fetch("/api/orders", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch {
      // Ignore errors
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, loadOrders]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "register") {
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        if (password !== confirm) throw new Error("Passwords do not match.");
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not create account.");
        await loadUser();
        toast("Account created. Karibu Trendora!");
      } else {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not sign in.");
        await loadUser();
        toast("Welcome back to Trendora.");
      }
      setPassword("");
      setConfirm("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMode("login");
    toast("You have been signed out.", "info");
  };

  if (loading) {
    return (
      <div className="container-shell flex items-center justify-center py-28 text-sm text-zinc-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-brand-700" />
        Loading your account…
      </div>
    );
  }

  if (user) {
    return (
      <div className="container-shell py-10 lg:py-16">
        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 font-display text-xl font-extrabold text-brand-700">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Signed in
                </p>
                <h1 className="font-display text-2xl font-extrabold tracking-tight">
                  {user.name}
                </h1>
                <p className="text-xs text-zinc-500">{user.email}</p>
                <span className={`inline-flex mt-1 items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  user.role === 'admin' ? 'bg-red-50 text-red-700' :
                  user.role === 'manager' ? 'bg-blue-50 text-blue-700' :
                  'bg-green-50 text-green-700'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>

            <div className="mt-6 border-b border-zinc-100">
              <nav role="tablist" aria-label="Account sections" className="flex gap-1">
                {[
                  { id: "overview", label: "Overview", icon: UserIcon },
                  { id: "orders", label: "Orders", icon: Package },
                  { id: "settings", label: "Settings", icon: ShieldCheck }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 text-xs font-semibold rounded-xl transition",
                        activeTab === tab.id
                          ? "bg-brand-50 text-brand-700"
                          : "text-zinc-500 hover:text-ink hover:bg-zinc-50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                      {tab.id === "orders" && orders.length > 0 && (
                        <span className="rounded-full bg-brand-50 text-brand-700 px-1.5 py-0.5 text-[9px] font-bold">
                          {orders.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {activeTab === "overview" && (
              <div className="mt-6 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-zinc-200 p-4">
                    <UserIcon className="h-4 w-4 text-brand-700" />
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                      Account
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                      {user.createdAt
                        ? `Member since ${formatDate(user.createdAt)}`
                        : "Trendora member"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 p-4">
                    <ShieldCheck className="h-4 w-4 text-brand-700" />
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                      Security
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                      Password protected, secure session
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/wishlist"
                    className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-xs font-semibold text-ink transition hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-brand-700" /> View your wishlist
                    </span>
                    <ArrowRight className="h-4 w-4 text-zinc-400" />
                  </Link>
                  <Link
                    href="/cart"
                    className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-xs font-semibold text-ink transition hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <span className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-brand-700" /> Review your cart
                    </span>
                    <ArrowRight className="h-4 w-4 text-zinc-400" />
                  </Link>
                  <Link
                    href="/shop"
                    className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-xs font-semibold text-ink transition hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-brand-700" /> Continue shopping
                    </span>
                    <ArrowRight className="h-4 w-4 text-zinc-400" />
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 transition hover:text-red-500"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="mt-6">
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-700" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-10 w-10 text-zinc-300" />
                    <p className="mt-3 text-sm font-semibold text-ink">No orders yet</p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Place an order to see it here.
                    </p>
                    <Link href="/shop" className="btn-primary mt-4 inline-block">
                      Start shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="rounded-xl border border-zinc-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-display text-sm font-extrabold text-ink">{order.id}</p>
                            <p className="text-[10px] text-zinc-400">
                              {formatDate(order.createdAt)} · {order.items.reduce((sum, item) => sum + item.qty, 0)} items
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold capitalize ${
                              order.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                              order.status === "cancelled" ? "bg-red-50 text-red-700" :
                              order.status === "shipped" ? "bg-blue-50 text-blue-700" :
                              "bg-amber-50 text-amber-700"
                            }`}>
                              {order.status}
                            </span>
                            <p className="font-display text-sm font-extrabold">{formatTZS(order.total)}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-zinc-600">
                          {order.items.map((item) => (
                            <span key={item.name} className="bg-smoke px-2 py-1 rounded">
                              {item.name} × {item.qty}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-zinc-200 p-4">
                  <h3 className="font-display text-sm font-extrabold">Account Settings</h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Manage your account preferences and security.
                  </p>
                  <div className="mt-4 space-y-3 text-xs">
                    <p className="flex items-center gap-2 text-zinc-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      Secure password hashing on the server
                    </p>
                    <p className="flex items-center gap-2 text-zinc-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      HTTP-only session cookie
                    </p>
                    <p className="flex items-center gap-2 text-zinc-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      Wishlist saved locally on this device
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 p-4 bg-amber-50">
                  <h3 className="font-display text-sm font-extrabold text-amber-800">Demo Account Notice</h3>
                  <p className="mt-1 text-xs text-amber-700">
                    This is a demo store. Order history is limited to this session.
                    For real order support, contact <a href={`mailto:${SITE.email}`} className="underline">{SITE.email}</a>.
                  </p>
                </div>
              </div>
            )}

          </div>

          <aside className="rounded-2xl bg-brand-800 p-6 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-200">
              Trendora account
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight">
              Style, saved and ready.
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-white/65">
              Your account keeps your wishlist and preferences together. Checkout
              data is still entered fresh each time in this prototype.
            </p>
            <div className="mt-6 space-y-3 text-[11px] text-white/75">
              <p className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                Secure password hashing on the server
              </p>
              <p className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                HTTP-only session cookie
              </p>
              <p className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                Wishlist saved on this device
              </p>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="container-shell py-10 lg:py-16">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-2xl border border-zinc-200 bg-white lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden bg-brand-800 p-8 text-white lg:block">
          <div className="absolute inset-0 hero-noise" />
          <div className="relative flex h-full flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-200">
              TRENDORA
            </p>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.05]">
              Your style,
              <br />
              your space.
            </h2>
            <p className="mt-4 text-xs leading-relaxed text-white/65">
              Sign in to keep your wishlist close and make every visit feel like
              yours.
            </p>
            <div className="mt-auto space-y-3 text-[11px] text-white/75">
              <p className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                Secure, cookie-based sessions
              </p>
              <p className="flex gap-2">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                Passwords are never stored in plain text
              </p>
              <p className="flex gap-2">
                <Heart className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                Save the pieces you love
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex rounded-full bg-smoke p-1">
            {(["login", "register"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setError("");
                }}
                className={cn(
                  "flex-1 rounded-full py-2.5 text-xs font-semibold capitalize transition",
                  mode === item
                    ? "bg-white text-ink shadow-sm"
                    : "text-zinc-500 hover:text-ink"
                )}
              >
                {item === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <h1 className="font-display text-2xl font-extrabold tracking-tight">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-xs text-zinc-500">
              {mode === "login"
                ? "Sign in with the email you used at TRENDORA."
                : "A few details and your Trendora account is ready."}
            </p>
          </div>

          <form onSubmit={submit} noValidate className="mt-6 space-y-4">
            {mode === "register" && (
              <div>
                <label htmlFor="account-name" className="text-[11px] font-semibold text-zinc-700">
                  Full name
                </label>
                <input
                  id="account-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="field mt-1.5"
                  autoComplete="name"
                  placeholder="Your full name"
                />
              </div>
            )}
            <div>
              <label htmlFor="account-email" className="text-[11px] font-semibold text-zinc-700">
                Email address
              </label>
              <input
                id="account-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field mt-1.5"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="account-password" className="text-[11px] font-semibold text-zinc-700">
                Password
              </label>
              <input
                id="account-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field mt-1.5"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder={mode === "login" ? "Your password" : "At least 6 characters"}
              />
            </div>
            {mode === "register" && (
              <div>
                <label htmlFor="account-confirm" className="text-[11px] font-semibold text-zinc-700">
                  Confirm password
                </label>
                <input
                  id="account-confirm"
                  type="password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  className="field mt-1.5"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                />
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-[11px] font-medium text-red-600">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Please wait…
                </>
              ) : mode === "login" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-4 text-[10px] leading-relaxed text-zinc-400">
            By continuing you agree to our{" "}
            <Link href="/terms" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            . Demo store — do not reuse a real banking password.
          </p>
        </div>
      </div>
    </div>
  );
}
