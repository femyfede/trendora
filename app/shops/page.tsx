import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Store } from "lucide-react";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Maduka ya Tanzania",
  description: "Gundua maduka yaliyoidhinishwa kwenye TRENDORA marketplace."
};

export default async function ShopsPage() {
  const db = await readDb();
  const shops = db.shops
    .filter((shop) => shop.status === "ACTIVE")
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="container-shell py-10 sm:py-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-700">
            Biashara zilizothibitishwa
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Maduka ya Tanzania
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
            Wasiliana moja kwa moja na biashara zilizoidhinishwa na TRENDORA.
          </p>
        </div>
        <Link href="/create-shop" className="btn-primary shrink-0">
          Fungua Duka Lako
        </Link>
      </div>

      {shops.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-5 py-14 text-center">
          <Store className="mx-auto h-8 w-8 text-zinc-300" />
          <h2 className="mt-3 font-display text-lg font-bold">Hakuna duka lililoidhinishwa bado</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Maduka yataonekana hapa baada ya malipo kuhakikiwa na idhini kutolewa.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <article key={shop.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Store className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-extrabold">{shop.name}</h2>
              <p className="mt-1 text-xs font-semibold text-brand-700">{shop.category}</p>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-600">{shop.description}</p>
              <p className="mt-4 flex items-start gap-2 text-xs text-zinc-500">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-700" />
                {shop.district}, {shop.region} · {shop.physicalLocation}
              </p>
              <a
                href={`tel:${shop.phone.replace(/[^\d+]/g, "")}`}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-ink transition hover:border-brand-700 hover:text-brand-700"
              >
                <Phone className="h-3.5 w-3.5" />
                Wasiliana na duka
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
