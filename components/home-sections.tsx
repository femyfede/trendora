"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Banknote, ClipboardList, MousePointerClick, PhoneCall, Search, Store, Truck } from "lucide-react";
import { IMAGES } from "@/lib/constants";
import { useStore } from "./store-context";
import { ShopCard, type PublicShop } from "./shop-card";

/** Three plain steps so a first-time visitor understands how buying works. */
export function HowItWorks() {
  const { tr } = useStore();
  const steps = [
    {
      icon: Search,
      title: tr("Find what you like", "Chagua unachopenda"),
      body: tr(
        "Browse by category or search. Every product shows the price in TZS and the sizes available.",
        "Tafuta au pitia kwa aina. Kila bidhaa inaonyesha bei kwa TZS na saizi zilizopo."
      )
    },
    {
      icon: MousePointerClick,
      title: tr("Place your order", "Weka oda yako"),
      body: tr(
        "Add to cart, enter your name, phone number and region. No card needed.",
        "Weka kwenye kikapu, jaza jina, namba ya simu na mkoa wako. Huhitaji kadi ya benki."
      )
    },
    {
      icon: Banknote,
      title: tr("Pay when it arrives", "Lipa ukipokea"),
      body: tr(
        "We call you before delivery. Check your items, then pay in cash.",
        "Tunakupigia kabla ya kukuletea. Kagua mzigo wako, kisha ulipe pesa taslimu."
      )
    }
  ];

  return (
    <section className="border-y border-zinc-200/70 bg-sand">
      <div className="container-shell py-12 sm:py-16">
        <div className="max-w-2xl">
          <p className="section-kicker">{tr("How it works", "Inavyofanya kazi")}</p>
          <h2 className="section-title mt-2">{tr("Buying is easy, in 3 steps", "Kununua ni rahisi, hatua 3 tu")}</h2>
        </div>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="relative rounded-2xl bg-white p-6 ring-1 ring-zinc-200/80">
                <span className="absolute right-5 top-4 font-display text-5xl font-extrabold text-zinc-100" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-brand-700 text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="relative mt-4 text-lg font-bold text-ink">
                  <span className="sr-only">{index + 1}. </span>
                  {step.title}
                </h3>
                <p className="relative mt-1.5 text-sm leading-relaxed text-zinc-600">{step.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/** Invites business owners to register, and shows real verified shops when there are any. */
export function SellerSection({ shops, shopCount }: { shops: PublicShop[]; shopCount: number }) {
  const { tr } = useStore();
  const steps = [
    { icon: ClipboardList, text: tr("Fill in your shop details", "Jaza taarifa za duka lako") },
    { icon: BadgeCheck, text: tr("Pay the registration fee and get verified", "Lipa ada ya usajili, duka lithibitishwe") },
    { icon: PhoneCall, text: tr("Customers find you and call you directly", "Wateja wakupate na kukupigia moja kwa moja") }
  ];

  return (
    <section className="container-shell py-12 sm:py-16">
      <div className="overflow-hidden rounded-3xl bg-brand-900 text-white">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sun-400">
              {tr("For business owners", "Kwa wafanyabiashara")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {tr("Have a shop? Bring it online.", "Una duka? Liweke mtandaoni.")}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
              {tr(
                "Whether you sell in Kariakoo, Arusha or Mwanza, customers across Tanzania can find your shop and contact you.",
                "Ukiwa unauza Kariakoo, Arusha au Mwanza, wateja kote Tanzania wanaweza kupata duka lako na kuwasiliana nawe."
              )}
            </p>
            <ol className="mt-7 space-y-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.text} className="flex items-center gap-3 text-sm font-medium text-white/90">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
                      <Icon className="h-4 w-4 text-sun-400" />
                    </span>
                    <span>
                      <span className="sr-only">{index + 1}. </span>
                      {step.text}
                    </span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/create-shop" className="btn-accent">
                <Store className="h-4 w-4" />
                {tr("Register your shop", "Sajili duka lako")}
              </Link>
              <Link href="/shops" className="inline-flex items-center gap-1.5 px-2 py-3 text-sm font-semibold text-white/85 hover:text-white">
                {shopCount > 0
                  ? tr(`See ${shopCount} verified shops`, `Tazama maduka ${shopCount} yaliyothibitishwa`)
                  : tr("See the shops directory", "Tazama orodha ya maduka")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="relative min-h-[280px] lg:min-h-full">
            <Image
              src={IMAGES.vendorPhone}
              alt={tr(
                "A Tanzanian trader at her stall checking orders on her phone",
                "Mfanyabiashara wa Kitanzania akiangalia oda kwenye simu yake bandani"
              )}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-[center_35%]"
            />
          </div>
        </div>
      </div>

      {shops.length > 0 && (
        <div className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <h3 className="font-display text-xl font-extrabold text-ink sm:text-2xl">
              {tr("Verified shops", "Maduka yaliyothibitishwa")}
            </h3>
            <Link href="/shops" className="text-sm font-semibold text-brand-700 hover:underline">
              {tr("View all", "Tazama yote")} →
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function PromoBanner() {
  const { tr } = useStore();
  return (
    <section className="container-shell pb-4 pt-12 sm:pt-16">
      <div className="grid overflow-hidden rounded-3xl bg-clay-50 ring-1 ring-clay-100 lg:grid-cols-2">
        <div className="relative min-h-[300px] lg:min-h-[440px]">
          <Image
            src={IMAGES.sewing}
            alt={tr(
              "Two women sewing a kitenge dress in a tailoring workshop",
              "Wanawake wawili wakishona gauni la kitenge kwenye karakana ya ushonaji"
            )}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-[center_30%]"
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
          <p className="section-kicker">{tr("Made by local hands", "Kazi ya mikono ya nyumbani")}</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            {tr("Style with a Tanzanian story.", "Mitindo yenye hadithi ya Kitanzania.")}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-600">
            {tr(
              "From kitenge dresses to everyday basics, our collections bring together pieces you will wear again and again.",
              "Kuanzia magauni ya kitenge hadi mavazi ya kila siku, mikusanyiko yetu inakuletea nguo utakazovaa tena na tena."
            )}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/collections" className="btn-primary">
              {tr("See collections", "Tazama mikusanyiko")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="inline-flex items-center gap-2 px-1 text-sm text-zinc-600">
              <Truck className="h-4 w-4 text-brand-700" />
              {tr("Delivery to all regions", "Tunafikisha mikoa yote")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
