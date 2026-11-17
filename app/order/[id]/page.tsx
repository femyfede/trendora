import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CreditCard, MapPin, MessageCircle, Package, Truck } from "lucide-react";
import { readDb } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n-server";
import { formatTZS, formatUSD, formatDate, cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, PAYMENT_METHODS, SITE, findRegion, formatEta } from "@/lib/constants";
import { canViewOrder } from "@/lib/order-access";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getTranslator();
  return {
    title: tr("Your order", "Oda yako"),
    robots: { index: false, follow: false }
  };
}

const PROGRESS = ["pending", "processing", "shipped", "completed"] as const;

export default async function OrderPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; access?: string }>;
}) {
  const [{ id }, query, { tr, language }] = await Promise.all([params, searchParams, getTranslator()]);
  const db = await readDb();
  const order = db.orders.find((item) => item.id === id);
  if (!order) notFound();
  const [admin, user] = await Promise.all([isAdmin(), getCurrentUser()]);
  if (!canViewOrder(order, { admin, userId: user?.id, accessToken: query.access ?? null })) {
    redirect("/account");
  }

  const region = findRegion(order.customer.region);
  const method = PAYMENT_METHODS.find((item) => item.id === order.paymentMethod) ?? PAYMENT_METHODS[0];
  const statusIndex = PROGRESS.indexOf(order.status as (typeof PROGRESS)[number]);
  const cancelled = order.status === "cancelled";

  return (
    <div className="container-shell py-8 lg:py-14">
      {query.success && (
        <div className="mx-auto max-w-3xl rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 text-center sm:p-8" role="status">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-emerald-600 shadow-sm">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {tr(`Thank you, ${order.customer.firstName}!`, `Asante, ${order.customer.firstName}!`)}
          </h1>
          <p className="mt-2 text-base text-zinc-700">
            {tr(
              `We have received your order. We will call you on ${order.customer.phone} before delivery.`,
              `Tumepokea oda yako. Tutakupigia kwenye ${order.customer.phone} kabla ya kukuletea.`
            )}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-800 shadow-sm">
            <Package className="h-4 w-4" />
            {tr("Order number:", "Namba ya oda:")} {order.id}
          </p>
          <p className="mt-3 text-xs text-zinc-600">
            {tr("Save this page or your order number to check your order later.", "Hifadhi ukurasa huu au namba ya oda ili kufuatilia oda yako baadaye.")}
          </p>
        </div>
      )}

      <div className="mx-auto mt-8 grid max-w-5xl gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{tr("Order", "Oda")}</p>
                <h2 className="mt-0.5 font-display text-xl font-extrabold">{order.id}</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {tr("Placed on", "Iliwekwa")} {formatDate(order.createdAt, language)}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold",
                  cancelled ? "bg-red-50 text-red-700" : order.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-sun-100 text-amber-800"
                )}
              >
                {ORDER_STATUS_LABELS[order.status][language]}
              </span>
            </div>

            {!cancelled && (
              <ol className="mt-6 grid grid-cols-4 gap-2" aria-label={tr("Order progress", "Hatua za oda")}>
                {PROGRESS.map((step, index) => (
                  <li key={step} className="text-center">
                    <span
                      className={cn(
                        "mx-auto block h-1.5 rounded-full",
                        index <= statusIndex ? "bg-brand-700" : "bg-zinc-200"
                      )}
                    />
                    <span className={cn("mt-2 block text-[11px] font-semibold leading-tight sm:text-xs", index <= statusIndex ? "text-ink" : "text-zinc-400")}>
                      {ORDER_STATUS_LABELS[step][language]}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            <ul className="mt-6 divide-y divide-zinc-100 border-t border-zinc-100">
              {order.items.map((item) => (
                <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3 py-3">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-smoke">
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <Link href={`/product/${item.slug}`} className="text-sm font-semibold text-ink hover:text-brand-700">
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-zinc-600">
                      {tr("Size", "Saizi")} {item.size} · {item.color} · ×{item.qty}
                    </p>
                    <p className="mt-auto text-sm font-bold text-ink">{formatTZS(item.price * item.qty)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-3 space-y-2 border-t border-zinc-100 pt-4 text-sm">
              <div className="flex justify-between text-zinc-700">
                <dt>{tr("Subtotal", "Jumla ya bidhaa")}</dt>
                <dd>{formatTZS(order.subtotal)}</dd>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>
                    {tr("Discount", "Punguzo")}
                    {order.discountCode ? ` (${order.discountCode})` : ""}
                  </dt>
                  <dd>−{formatTZS(order.discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-zinc-700">
                <dt>{tr("Delivery", "Usafirishaji")}</dt>
                <dd>{order.shippingFee === 0 ? tr("Free", "Bure") : formatTZS(order.shippingFee)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-zinc-100 pt-3">
                <dt className="font-semibold text-ink">{tr("Total", "Jumla")}</dt>
                <dd className="text-right">
                  <p className="font-display text-xl font-extrabold">{formatTZS(order.total)}</p>
                  <p className="text-xs text-zinc-500">≈ {formatUSD(order.total)}</p>
                </dd>
              </div>
            </dl>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="flex items-center gap-2 font-display text-base font-extrabold">
                <MapPin className="h-4 w-4 text-brand-700" />
                {tr("Delivery address", "Mahali pa kuletewa")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-700">
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
                <p className="mt-2 rounded-lg bg-smoke px-2.5 py-2 text-xs text-zinc-600">
                  {tr("Note:", "Maelekezo:")} {order.customer.notes}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="flex items-center gap-2 font-display text-base font-extrabold">
                <Truck className="h-4 w-4 text-brand-700" />
                {tr("Delivery time", "Muda wa kufika")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-700">
                {region
                  ? tr(
                      `${region.name}: ${formatEta(region.eta, "en")} after dispatch.`,
                      `${region.name}: ${formatEta(region.eta, "sw")} baada ya kutumwa.`
                    )
                  : tr("We will confirm the delivery time with you by phone.", "Tutathibitisha muda wa kufika kwa simu.")}
              </p>
              <h2 className="mt-4 flex items-center gap-2 font-display text-base font-extrabold">
                <CreditCard className="h-4 w-4 text-brand-700" />
                {tr("Payment", "Malipo")}
              </h2>
              <p className="mt-1.5 text-sm font-medium text-zinc-800">{method.label[language]}</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                {order.paymentMethod === "cod"
                  ? tr(
                      "Pay in cash when your order arrives. Please have the exact amount ready if you can.",
                      "Lipa pesa taslimu mzigo ukifika. Ikiwezekana andaa kiasi kamili."
                    )
                  : method.description[language]}
              </p>
            </div>
          </section>
        </div>

        <aside>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-extrabold">{tr("Need help with this order?", "Unahitaji msaada na oda hii?")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              {tr("Call or WhatsApp us and mention your order number.", "Tupigie au tutumie WhatsApp na utaje namba ya oda yako.")}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={`tel:${SITE.phoneHref}`} className="btn-outline px-3 py-3">
                {tr("Call", "Piga simu")}
              </a>
              <a
                href={`https://wa.me/${SITE.phoneHref.replace("+", "")}?text=${encodeURIComponent(`Oda ${order.id}`)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-outline px-3 py-3"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                WhatsApp
              </a>
            </div>
            <Link href="/shop" className="btn-primary mt-5 w-full">
              {tr("Continue shopping", "Endelea kununua")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {user && (
              <Link href="/account" className="mt-2 block py-2 text-center text-sm font-semibold text-brand-700 hover:underline">
                {tr("See all my orders", "Tazama oda zangu zote")}
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
