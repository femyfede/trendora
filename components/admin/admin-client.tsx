"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Loader2,
  Lock,
  LogOut,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Tag,
  Trash2,
  TrendingUp,
  Users,
  LineChart,
  DollarSign
} from "lucide-react";
import type { Discount, Order, Product } from "@/lib/types";
import { ORDER_STATUSES } from "@/lib/constants";
import { AdminProductForm } from "@/components/admin/product-form";
import { useStore } from "@/components/store-context";
import { cn, formatDate, formatTZS } from "@/lib/utils";

type Tab = "overview" | "analytics" | "products" | "orders" | "discounts" | "users";

const TABS: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "analytics", label: "Analytics", icon: LineChart },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "discounts", label: "Discounts", icon: Tag },
  { id: "users", label: "Users", icon: Users }
];

export function AdminClient() {
  const { toast } = useStore();
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [productSearch, setProductSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const [freeShipping, setFreeShipping] = useState(false);
  const [discountDescription, setDiscountDescription] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [savingDiscount, setSavingDiscount] = useState(false);

  const loadAll = useCallback(async () => {
    setLoadingData(true);
    try {
      const [productsRes, ordersRes, discountsRes, usersRes, analyticsRes] = await Promise.all([
        fetch("/api/products?all=1", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/discounts", { cache: "no-store" }),
        fetch("/api/admin/users", { cache: "no-store" }),
        fetch("/api/admin/analytics", { cache: "no-store" })
      ]);
      if (ordersRes.status === 401 || discountsRes.status === 401 || usersRes.status === 401 || analyticsRes.status === 401) {
        setAdmin(false);
        return;
      }
      setProducts(await productsRes.json());
      setOrders(await ordersRes.json());
      setDiscounts(await discountsRes.json());
      setUsers(await usersRes.json());
      setAnalytics(await analyticsRes.json());
    } catch {
      toast("Could not load dashboard data.", "error");
    } finally {
      setLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    fetch("/api/admin/me", { cache: "no-store" })
      .then((response) => response.json())
      .then(async (data: { admin: boolean }) => {
        setAdmin(data.admin);
        if (data.admin) await loadAll();
      })
      .catch(() => setAdmin(false));
  }, [loadAll]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not sign in.");
      setAdmin(true);
      setPassword("");
      await loadAll();
    } catch (caught) {
      setLoginError(caught instanceof Error ? caught.message : "Could not sign in.");
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAdmin(false);
    setProducts([]);
    setOrders([]);
    setDiscounts([]);
  };

  const stats = useMemo(() => {
    const valid = orders.filter((order) => order.status !== "cancelled");
    const revenue = valid.reduce((sum, order) => sum + order.total, 0);
    const lowStock = products.filter((product) => product.stock <= 5);
    return {
      revenue,
      orders: orders.length,
      pending: orders.filter((order) => order.status === "pending").length,
      average: valid.length ? Math.round(revenue / valid.length) : 0,
      lowStock,
      products: products.length,
      activeProducts: products.filter((product) => product.isActive).length
    };
  }, [orders, products]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(query)
    );
  }, [products, productSearch]);

  const updateOrderStatus = async (order: Order, status: string) => {
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update order.");
      setOrders((current) =>
        current.map((item) => (item.id === order.id ? (data.order as Order) : item))
      );
      toast(`Order ${order.id} updated to ${status}.`);
      if (status === "cancelled") loadAll();
    } catch (caught) {
      toast(caught instanceof Error ? caught.message : "Update failed.", "error");
    }
  };

  const deleteProduct = async (product: Product) => {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
    try {
      const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete product.");
      setProducts((current) => current.filter((item) => item.id !== product.id));
      toast("Product deleted.");
    } catch (caught) {
      toast(caught instanceof Error ? caught.message : "Delete failed.", "error");
    }
  };

  const createDiscount = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingDiscount(true);
    setDiscountError("");
    try {
      const response = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          percent: Number(percent),
          freeShipping,
          description: discountDescription
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create discount.");
      setDiscounts((current) => [data.discount, ...current]);
      setCode("");
      setPercent("10");
      setFreeShipping(false);
      setDiscountDescription("");
      toast("Discount created.");
    } catch (caught) {
      setDiscountError(caught instanceof Error ? caught.message : "Could not save.");
    } finally {
      setSavingDiscount(false);
    }
  };

  const toggleDiscount = async (discount: Discount) => {
    try {
      const response = await fetch(`/api/discounts/${discount.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !discount.active })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update.");
      setDiscounts((current) =>
        current.map((item) => (item.code === discount.code ? data.discount : item))
      );
    } catch (caught) {
      toast(caught instanceof Error ? caught.message : "Update failed.", "error");
    }
  };

  const deleteDiscount = async (discount: Discount) => {
    if (!window.confirm(`Delete discount ${discount.code}?`)) return;
    try {
      const response = await fetch(`/api/discounts/${discount.code}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Could not delete discount.");
      setDiscounts((current) => current.filter((item) => item.code !== discount.code));
      toast("Discount deleted.");
    } catch (caught) {
      toast(caught instanceof Error ? caught.message : "Delete failed.", "error");
    }
  };

  const toggleUserStatus = async (user: any) => {
    if (!window.confirm(`${user.isActive ? "Deactivate" : "Activate"} user ${user.name}?`)) return;
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive })
      });
      if (!response.ok) throw new Error("Could not update user.");
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? { ...item, isActive: !user.isActive } : item))
      );
      toast(`User ${user.name} ${user.isActive ? "deactivated" : "activated"}.`);
    } catch (caught) {
      toast(caught instanceof Error ? caught.message : "Update failed.", "error");
    }
  };

  if (admin === null) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center text-sm text-zinc-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-brand-700" />
        Checking admin access…
      </div>
    );
  }

  if (admin === false) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-smoke px-4 py-14">
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-card sm:p-8"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-700 text-white">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
            Admin sign in
          </h1>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
            Authorised staff only. This dashboard manages products, inventory,
            discounts and orders.
          </p>

          <label
            htmlFor="admin-password"
            className="mt-6 block text-[11px] font-semibold text-zinc-700"
          >
            Admin password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setLoginError("");
            }}
            className="field mt-1.5"
            autoComplete="current-password"
            placeholder="Enter admin password"
          />

          {loginError && (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-medium text-red-600">
              {loginError}
            </p>
          )}

          <button type="submit" disabled={loggingIn} className="btn-primary mt-4 w-full">
            {loggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </button>

          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-[10px] leading-relaxed text-amber-800">
            Demo default password: <strong>trendora2026</strong>. Set
            <code className="mx-1 rounded bg-white px-1">ADMIN_PASSWORD</code>
            in <code className="rounded bg-white px-1">.env.local</code> before deploying.
          </p>
          <Link
            href="/"
            className="mt-4 block text-center text-[11px] font-semibold text-zinc-500 hover:text-brand-700"
          >
            ← Back to store
          </Link>
        </form>
      </div>
    );
  }

  // Admin dashboard (admin === true)
  return (
    <div className="min-h-screen bg-smoke/60">
      <div className="border-b border-zinc-200 bg-white">
        <div className="container-shell flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-700">
              TRENDORA admin
            </p>
            <h1 className="font-display text-xl font-extrabold tracking-tight">
              Store dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAll}
              disabled={loadingData}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-2 text-[11px] font-semibold text-zinc-600 transition hover:border-zinc-300 hover:text-ink"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loadingData && "animate-spin")} />
              Refresh
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-2 text-[11px] font-semibold text-zinc-600 transition hover:border-zinc-300 hover:text-ink"
            >
              View store <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-zinc-800"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>

        <div className="container-shell no-scrollbar flex gap-1 overflow-x-auto">
          {TABS.map((item) => {
            const Icon = item.icon;
            const count =
              item.id === "products"
                ? products.length
                : item.id === "orders"
                  ? orders.length
                  : item.id === "discounts"
                    ? discounts.length
                    : undefined;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 px-3.5 py-3.5 text-xs font-semibold transition",
                  tab === item.id
                    ? "text-brand-700 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand-700"
                    : "text-zinc-500 hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {typeof count === "number" && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[9px]",
                      tab === item.id ? "bg-brand-50 text-brand-700" : "bg-zinc-100 text-zinc-500"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="container-shell py-7">
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Revenue",
                  value: formatTZS(stats.revenue),
                  note: "Excludes cancelled orders",
                  icon: TrendingUp
                },
                {
                  label: "Orders",
                  value: String(stats.orders),
                  note: `${stats.pending} awaiting action`,
                  icon: ShoppingCart
                },
                {
                  label: "Average order",
                  value: formatTZS(stats.average),
                  note: "Across completed carts",
                  icon: BarChart3
                },
                {
                  label: "Low stock",
                  value: String(stats.lowStock.length),
                  note: "5 units or fewer",
                  icon: AlertTriangle
                }
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="rounded-2xl border border-zinc-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                        {card.label}
                      </p>
                      <Icon className="h-4 w-4 text-brand-700" />
                    </div>
                    <p className="mt-3 font-display text-xl font-extrabold text-ink">
                      {card.value}
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-400">{card.note}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
              <div className="rounded-2xl border border-zinc-200 bg-white">
                <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                  <h2 className="font-display text-sm font-extrabold">Recent orders</h2>
                  <button
                    type="button"
                    onClick={() => setTab("orders")}
                    className="text-[10px] font-semibold text-brand-700 hover:underline"
                  >
                    View all
                  </button>
                </div>
                {orders.length === 0 ? (
                  <p className="px-5 py-10 text-center text-xs text-zinc-400">
                    No orders yet. Your first order will appear here.
                  </p>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-ink">{order.id}</p>
                          <p className="truncate text-[10px] text-zinc-400">
                            {order.customer.firstName} {order.customer.lastName} ·{" "}
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-ink">{formatTZS(order.total)}</p>
                          <p className="text-[10px] capitalize text-zinc-400">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white">
                <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                  <h2 className="font-display text-sm font-extrabold">Inventory alerts</h2>
                  <button
                    type="button"
                    onClick={() => setTab("products")}
                    className="text-[10px] font-semibold text-brand-700 hover:underline"
                  >
                    Manage
                  </button>
                </div>
                {stats.lowStock.length === 0 ? (
                  <p className="px-5 py-10 text-center text-xs text-zinc-400">
                    All products are well stocked.
                  </p>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {stats.lowStock.slice(0, 6).map((product) => (
                      <div key={product.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded bg-smoke">
                          <Image src={product.images[0]} alt="" fill sizes="32px" className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-ink">{product.name}</p>
                          <p className="text-[10px] text-zinc-400">{product.category}</p>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[9px] font-bold",
                            product.stock === 0
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-700"
                          )}
                        >
                          {product.stock} left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-[10px] uppercase tracking-wide text-zinc-400">Catalogue</p>
                <p className="mt-1 text-xs text-zinc-600">
                  <strong className="text-ink">{stats.activeProducts}</strong> active of{" "}
                  {stats.products} products
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-[10px] uppercase tracking-wide text-zinc-400">Discounts</p>
                <p className="mt-1 text-xs text-zinc-600">
                  <strong className="text-ink">
                    {discounts.filter((item) => item.active).length}
                  </strong>{" "}
                  active codes
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="text-[10px] uppercase tracking-wide text-zinc-400">Delivery</p>
                <p className="mt-1 text-xs text-zinc-600">Tanzania regions configured</p>
              </div>
            </div>
          </div>
        )}

        {tab === "products" && (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Search products…"
                  className="field py-2.5 pl-9 text-xs"
                  aria-label="Search products"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditProduct(null);
                  setFormOpen(true);
                }}
                className="btn-primary py-2.5 text-xs"
              >
                <Plus className="h-4 w-4" /> Add product
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="border-b border-zinc-100 bg-smoke/60 text-[10px] uppercase tracking-wide text-zinc-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Product</th>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold">Price</th>
                      <th className="px-4 py-3 font-semibold">Stock</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="text-xs hover:bg-smoke/40">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-smoke">
                              <Image
                                src={product.images[0]}
                                alt=""
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink">{product.name}</p>
                              <p className="text-[10px] text-zinc-400">{product.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-600">{product.category}</td>
                        <td className="px-4 py-3 font-semibold text-ink">
                          {formatTZS(product.price)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              product.stock === 0
                                ? "bg-red-50 text-red-600"
                                : product.stock <= 5
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                            )}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                              product.isActive
                                ? "bg-brand-50 text-brand-700"
                                : "bg-zinc-100 text-zinc-500"
                            )}
                          >
                            {product.isActive ? "Active" : "Hidden"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditProduct(product);
                                setFormOpen(true);
                              }}
                              className="rounded-lg p-2 text-zinc-400 transition hover:bg-brand-50 hover:text-brand-700"
                              aria-label={`Edit ${product.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProduct(product)}
                              className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                              aria-label={`Delete ${product.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredProducts.length === 0 && (
                <p className="px-5 py-10 text-center text-xs text-zinc-400">
                  No products match that search.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 && (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
                <ShoppingCart className="mx-auto h-6 w-6 text-zinc-300" />
                <p className="mt-3 text-sm font-semibold text-ink">No orders yet</p>
                <p className="mt-1 text-xs text-zinc-400">
                  Place a test order from the storefront to see it here.
                </p>
              </div>
            )}
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-sm font-extrabold text-ink">{order.id}</p>
                    <p className="text-[10px] text-zinc-400">
                      {formatDate(order.createdAt)} ·{" "}
                      {order.items.reduce((sum, item) => sum + item.qty, 0)} items
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-zinc-600">
                      {order.paymentMethod === "test" ? "Test paid" : order.paymentStatus}
                    </span>
                    <label className="sr-only" htmlFor={`status-${order.id}`}>
                      Order status
                    </label>
                    <select
                      id={`status-${order.id}`}
                      value={order.status}
                      onChange={(event) => updateOrderStatus(order, event.target.value)}
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[10px] font-semibold capitalize text-ink outline-none focus:border-brand-600"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <p className="font-display text-sm font-extrabold">{formatTZS(order.total)}</p>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-[11px] text-zinc-500 sm:grid-cols-3">
                  <p>
                    <span className="font-semibold text-ink">
                      {order.customer.firstName} {order.customer.lastName}
                    </span>
                    <br />
                    {order.customer.phone}
                    <br />
                    {order.customer.email}
                  </p>
                  <p>
                    {order.customer.address}
                    <br />
                    {order.customer.city}, {order.customer.region}
                    <br />
                    {order.customer.country}
                  </p>
                  <p>
                    Delivery: {order.shippingFee === 0 ? "Free" : formatTZS(order.shippingFee)}
                    <br />
                    Discount: {order.discountAmount ? formatTZS(order.discountAmount) : "—"}
                    {order.discountCode ? ` (${order.discountCode})` : ""}
                  </p>
                </div>

                <details className="mt-3 border-t border-zinc-100 pt-2">
                  <summary className="cursor-pointer text-[10px] font-semibold text-brand-700">
                    Order items
                  </summary>
                  <div className="mt-2 space-y-1.5">
                    {order.items.map((item) => (
                      <div
                        key={`${item.productId}-${item.size}-${item.color}`}
                        className="flex justify-between gap-3 text-[11px] text-zinc-600"
                      >
                        <span>
                          {item.name} · {item.size} · {item.color} × {item.qty}
                        </span>
                        <span className="font-medium text-ink">
                          {formatTZS(item.price * item.qty)}
                        </span>
                      </div>
                    ))}
                    {order.customer.notes && (
                      <p className="rounded bg-smoke px-2 py-1.5 text-[10px] text-zinc-500">
                        Note: {order.customer.notes}
                      </p>
                    )}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}

        {tab === "discounts" && (
          <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
            <form
              onSubmit={createDiscount}
              className="h-fit rounded-2xl border border-zinc-200 bg-white p-5"
            >
              <h2 className="font-display text-sm font-extrabold">Create discount</h2>
              <p className="mt-1 text-[10px] text-zinc-400">
                Codes apply at cart and checkout. Only active codes are accepted.
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <label htmlFor="discount-code" className="text-[11px] font-semibold text-zinc-700">
                    Code
                  </label>
                  <input
                    id="discount-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    className="field mt-1.5 text-xs uppercase"
                    placeholder="TREND10"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="discount-percent" className="text-[11px] font-semibold text-zinc-700">
                    Percent off
                  </label>
                  <input
                    id="discount-percent"
                    type="number"
                    min="0"
                    max="90"
                    value={percent}
                    onChange={(event) => setPercent(event.target.value)}
                    className="field mt-1.5 text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="discount-desc" className="text-[11px] font-semibold text-zinc-700">
                    Description
                  </label>
                  <input
                    id="discount-desc"
                    value={discountDescription}
                    onChange={(event) => setDiscountDescription(event.target.value)}
                    className="field mt-1.5 text-xs"
                    placeholder="10% off your order"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium text-zinc-600">
                  <input
                    type="checkbox"
                    checked={freeShipping}
                    onChange={(event) => setFreeShipping(event.target.checked)}
                    className="h-4 w-4 accent-brand-700"
                  />
                  Also grant free shipping
                </label>
                {discountError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-[10px] font-medium text-red-600">
                    {discountError}
                  </p>
                )}
                <button type="submit" disabled={savingDiscount} className="btn-primary w-full py-2.5 text-xs">
                  {savingDiscount ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Add discount
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="rounded-2xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-100 px-5 py-4">
                <h2 className="font-display text-sm font-extrabold">All discounts</h2>
              </div>
              <div className="divide-y divide-zinc-100">
                {discounts.map((discount) => (
                  <div
                    key={discount.code}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  >
                    <div>
                      <p className="flex items-center gap-2 font-display text-sm font-bold text-ink">
                        {discount.code}
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                            discount.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-zinc-100 text-zinc-400"
                          )}
                        >
                          {discount.active ? "Active" : "Paused"}
                        </span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-zinc-400">
                        {discount.description} · {discount.percent}% off
                        {discount.freeShipping ? " · Free shipping" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleDiscount(discount)}
                        className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[10px] font-semibold text-zinc-600 transition hover:border-brand-300 hover:text-brand-700"
                      >
                        {discount.active ? "Pause" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDiscount(discount)}
                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                        aria-label={`Delete discount ${discount.code}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {discounts.length === 0 && (
                  <p className="px-5 py-10 text-center text-xs text-zinc-400">
                    No discount codes yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "analytics" && analytics && (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Total Revenue",
                  value: formatTZS(analytics.overview.totalRevenue),
                  note: "All time",
                  icon: DollarSign
                },
                {
                  label: "30-Day Revenue",
                  value: formatTZS(analytics.overview.recentRevenue),
                  note: "Last 30 days",
                  icon: TrendingUp
                },
                {
                  label: "Total Orders",
                  value: String(analytics.overview.totalOrders),
                  note: `${analytics.overview.recentOrders} in last 30 days`,
                  icon: ShoppingCart
                },
                {
                  label: "Avg Order Value",
                  value: formatTZS(analytics.overview.averageOrderValue),
                  note: "All completed orders",
                  icon: BarChart3
                }
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="rounded-2xl border border-zinc-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                        {card.label}
                      </p>
                      <Icon className="h-4 w-4 text-brand-700" />
                    </div>
                    <p className="mt-3 font-display text-xl font-extrabold text-ink">
                      {card.value}
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-400">{card.note}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
              <div className="rounded-2xl border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 px-5 py-4">
                  <h2 className="font-display text-sm font-extrabold">Revenue (Last 30 Days)</h2>
                </div>
                <div className="p-5 h-64">
                  {analytics.revenueByDay.length > 0 ? (
                    <div className="h-full flex items-end gap-1">
                      {analytics.revenueByDay.map((day: { date: string; revenue: number }) => (
                        <div
                          key={day.date}
                          className="flex-1 bg-brand-700 rounded-t transition hover:bg-brand-600 cursor-pointer"
                          style={{ height: `${Math.max(10, (day.revenue / Math.max(...analytics.revenueByDay.map((d: { revenue: number }) => d.revenue))) * 100)}%` }}
                          title={`${day.date}: ${formatTZS(day.revenue)}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-xs text-zinc-400 h-full flex items-center justify-center">No revenue data</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 px-5 py-4">
                  <h2 className="font-display text-sm font-extrabold">Top Products</h2>
                </div>
                <div className="divide-y divide-zinc-100">
                  {analytics.topProducts.slice(0, 5).map((product: any) => (
                    <div key={product.productId} className="flex items-center justify-between px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-ink">{product.name}</p>
                        <p className="text-[10px] text-zinc-400">{product.sold} sold</p>
                      </div>
                      <p className="text-xs font-bold text-ink">{formatTZS(product.revenue)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 px-5 py-4">
                  <h2 className="font-display text-sm font-extrabold">Orders by Status</h2>
                </div>
                <div className="p-5 space-y-3">
                  {Object.entries(analytics.ordersByStatus as Record<string, number>).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize text-xs font-medium text-ink">{status}</span>
                      <span className="rounded-full bg-brand-50 text-brand-700 px-2 py-1 text-[10px] font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 px-5 py-4">
                  <h2 className="font-display text-sm font-extrabold">Conversion</h2>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-600">Conversion Rate</span>
                    <span className="font-display text-lg font-extrabold text-brand-700">{analytics.overview.conversionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-600">New Customers (30d)</span>
                    <span className="font-semibold text-ink">{analytics.overview.newCustomers}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-100 px-5 py-4">
                <h2 className="font-display text-sm font-extrabold">Low Stock Alerts</h2>
              </div>
              {analytics.lowStockProducts.length === 0 ? (
                <p className="px-5 py-10 text-center text-xs text-zinc-400">All products well stocked</p>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {analytics.lowStockProducts.map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded bg-smoke">
                          <img src={products.find((p: any) => p.id === product.id)?.images[0] || "/placeholder.jpg"} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-ink">{product.name}</p>
                          <p className="text-[10px] text-zinc-400">{product.category}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${product.stock === 0 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>
                        {product.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-lg font-extrabold">User Management</h2>
              <p className="text-xs text-zinc-500">{users.length} total users</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="border-b border-zinc-100 bg-smoke/60 text-[10px] uppercase tracking-wide text-zinc-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold">User</th>
                      <th className="px-4 py-3 font-semibold">Email</th>
                      <th className="px-4 py-3 font-semibold">Role</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Last Login</th>
                      <th className="px-4 py-3 font-semibold">Created</th>
                      <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {users.map((user: any) => (
                      <tr key={user.id} className="text-xs hover:bg-smoke/40">
                        <td className="px-4 py-3 font-medium text-ink">{user.name}</td>
                        <td className="px-4 py-3 text-zinc-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            user.role === "admin" ? "bg-red-50 text-red-700" :
                            user.role === "manager" ? "bg-blue-50 text-blue-700" :
                            "bg-green-50 text-green-700"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                          }`}>
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}
                        </td>
                        <td className="px-4 py-3 text-zinc-500">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => toggleUserStatus(user)}
                              className="rounded-lg p-2 text-zinc-400 transition hover:bg-brand-50 hover:text-brand-700"
                              aria-label={user.isActive ? `Deactivate ${user.name}` : `Activate ${user.name}`}
                            >
                              {user.isActive ? (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              ) : (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && (
                <p className="px-5 py-10 text-center text-xs text-zinc-400">No users found</p>
              )}
            </div>
          </div>
        )}
      </div>

      {formOpen && (
        <AdminProductForm
          product={editProduct}
          onClose={() => setFormOpen(false)}
          onSaved={loadAll}
        />
      )}
    </div>
  );
}
