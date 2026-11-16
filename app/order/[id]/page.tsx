import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Truck
} from "lucide-react";
import { readDb } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { formatTZS, formatUSD, formatDate } from "@/lib/utils";
import { PAYMENT_METHODS, REGIONS } from "@/lib/constants";
import { verifyOrderAccessToken } from "@/lib/order-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Thank you for shopping with TRENDORA.",
  robots: { index: false, follow: false }
};

export default async function OrderPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; access?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const db = await readDb();
  const order = db.orders.find((item) => item.id === id);
  if (!order) notFound();
  const [admin, user] = await Promise.all([isAdmin(), getCurrentUser()]);
  if (
    !admin &&
    user?.id !== order.userId &&
    !verifyOrderAccessToken(query.access ?? null, order.accessTokenHash)
  ) {
    redirect("/account");
  }

  const region = REGIONS.find((item) => item.name === order.customer.region);
  const method =
    PAYMENT_METHODS.find((item) => item.id === order.paymentMethod) ??
    PAYMENT_METHODS[0];

  return (
    <div className="container-shell py-10 lg:py-16">
      {query.success && (
        <div className="mx-auto max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 text-center sm:p-8">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-emerald-600 shadow-sm">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink">
            Thank you, {order.customer.firstName}.
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Your order has been received. A confirmation has been prepared for{" "}
            <span className="font-semibold text-ink">{order.customer.email}</span>.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-800 shadow-sm">
            <Package className="h-4 w-4" />
            Order {order.id}
          </p>
        </div>
      )}

      <div className="mx-auto mt-8 grid max-w-5xl gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Order
                </p>
                <h2 className="mt-0.5 font-display text-xl font-extrabold">{order.id}</h2>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Placed {formatDate(order.createdAt)}
                </p>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                {order.status}
              </span>
            </div>

            <div className="mt-5 divide-y divide-zinc-100 border-t border-zinc-100">
              {order.items.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3 py-3">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-smoke">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-sm font-semibold text-ink hover:text-brand-700"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-zinc-500">
                      Size {item.size} · {item.color}
                    </p>
                    <p className="text-[11px] text-zinc-500">Qty {item.qty}</p>
                    <p className="mt-auto text-xs font-bold text-ink">
                      {formatTZS(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-2 border-t border-zinc-100 pt-4 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>{formatTZS(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount{order.discountCode ? ` (${order.discountCode})` : ""}</span>
                  <span>−{formatTZS(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>Delivery</span>
                <span>
                  {order.shippingFee === 0 ? "Free" : formatTZS(order.shippingFee)}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-zinc-100 pt-3">
                <span className="font-semibold text-ink">Total</span>
                <div className="text-right">
                  <p className="font-display text-xl font-extrabold">
                    {formatTZS(order.total)}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    ≈ {formatUSD(order.total)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="flex items-center gap-2 font-display text-sm font-extrabold">
                <MapPin className="h-4 w-4 text-brand-700" />
                Delivery address
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                {order.customer.firstName} {order.customer.lastName}
                <br />
                {order.customer.address}
                <br />
                {order.customer.city}, {order.customer.region}
                <br />
                {order.customer.country}
                <br />
                {order.customer.phone}
              </p>
              {order.customer.notes && (
                <p className="mt-2 rounded-lg bg-smoke px-2.5 py-2 text-[10px] text-zinc-500">
                  Note: {order.customer.notes}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="flex items-center gap-2 font-display text-sm font-extrabold">
                <Truck className="h-4 w-4 text-brand-700" />
                Delivery estimate
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                {region
                  ? `${region.name}: ${region.eta} after dispatch.`
                  : "Our team will confirm the international delivery timeline by email."}
              </p>
              <p className="mt-2 text-[11px] text-zinc-500">
                Orders are usually packed within 1 business day. You will be
                contacted on {order.customer.phone} before delivery.
              </p>
              <h2 className="mt-4 flex items-center gap-2 font-display text-sm font-extrabold">
                <CreditCard className="h-4 w-4 text-brand-700" />
                Payment
              </h2>
              <p className="mt-1.5 text-xs text-zinc-600">{method.label}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
                {order.paymentMethod === "test"
                  ? "Demo test payment completed in sandbox mode. No real money was charged."
                  : order.paymentMethod === "cod"
                    ? "Payment is due in cash when your order arrives. Please have the exact amount ready if possible."
                    : "Mobile money integrations are not active yet. Our team will contact you."}
              </p>
            </div>
          </section>

          <div className="rounded-2xl border border-zinc-200 bg-[#FAFBFB] p-5 text-center">
            <Mail className="mx-auto h-5 w-5 text-brand-700" />
            <p className="mt-2 text-xs font-semibold text-ink">Need to change something?</p>
            <p className="mt-1 text-[11px] text-zinc-500">
              Call us on +255 712 345 678 or email hello@trendora.co.tz and quote
              your order number.
            </p>
          </div>
        </div>

        <aside>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-extrabold">What happens next?</h2>
            <ol className="mt-4 space-y-4 text-xs">
              {[
                ["Order received", "We have your order and are preparing it now."],
                ["Quality check & packing", "Every piece is checked before it leaves our studio."],
                ["Dispatch", "We hand your parcel to our delivery partner and contact you."],
                ["Delivery", "Pay on delivery or receive your prepaid parcel."]
              ].map(([title, body], index) => (
                <li key={title} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{title}</p>
                    <p className="mt-0.5 leading-relaxed text-zinc-500">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/shop" className="btn-primary mt-6 w-full">
              Continue shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/account"
              className="mt-2 block text-center text-[11px] font-semibold text-brand-700 hover:underline"
            >
              View account
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
