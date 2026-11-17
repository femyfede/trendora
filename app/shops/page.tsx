import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, PhoneCall, Store } from "lucide-react";
import { readDb } from "@/lib/db";
import { getTranslator } from "@/lib/i18n-server";
import { IMAGES } from "@/lib/constants";
import { ShopsDirectory } from "@/components/shops-directory";
import type { PublicShop } from "@/components/shop-card";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getTranslator();
  return {
    title: tr("Verified shops in Tanzania", "Maduka yaliyothibitishwa Tanzania"),
    description: tr(
      "Find verified Tanzanian shops and contact them directly by phone or WhatsApp.",
      "Pata maduka ya Tanzania yaliyothibitishwa na uwasiliane nayo moja kwa moja kwa simu au WhatsApp."
    )
  };
}

export default async function ShopsPage() {
  const [{ tr }, db] = await Promise.all([getTranslator(), readDb()]);
  // Only public fields are sent to the browser (no owner id, email or internal status).
  const shops: PublicShop[] = db.shops
    .filter((shop) => shop.status === "ACTIVE")
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ id, name, category, description, region, district, physicalLocation, phone, whatsapp }) => ({
      id,
      name,
      category,
      description,
      region,
      district,
      physicalLocation,
      phone,
      whatsapp
    }));

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <Image
          src={IMAGES.stoneTown}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_60%] opacity-30"
        />
        <div className="container-shell relative py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sun-400">
            {tr("Shops directory", "Orodha ya maduka")}
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {tr("Verified shops across Tanzania", "Maduka yaliyothibitishwa kote Tanzania")}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85">
            {tr(
              "Every shop here has been checked by our team. Call or WhatsApp the seller directly.",
              "Kila duka hapa limekaguliwa na timu yetu. Mpigie au mtumie muuzaji WhatsApp moja kwa moja."
            )}
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
            <li className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-sun-400" />
              {tr("Payment and details verified", "Malipo na taarifa zimehakikiwa")}
            </li>
            <li className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-sun-400" />
              {tr("Contact sellers directly", "Wasiliana na muuzaji moja kwa moja")}
            </li>
          </ul>
        </div>
      </section>

      <div className="container-shell py-10 sm:py-12">
        <ShopsDirectory shops={shops} />

        <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl bg-clay-50 p-6 ring-1 ring-clay-100 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="font-display text-xl font-extrabold">{tr("Own a shop?", "Una duka?")}</h2>
            <p className="mt-1 text-sm text-zinc-700">
              {tr("Get listed and reach customers across Tanzania.", "Liorodheshe hapa uwafikie wateja kote Tanzania.")}
            </p>
          </div>
          <Link href="/create-shop" className="btn-accent shrink-0">
            <Store className="h-4 w-4" />
            {tr("Register your shop", "Sajili duka lako")}
          </Link>
        </div>
      </div>
    </div>
  );
}
