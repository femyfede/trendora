import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { readDb } from "@/lib/db";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Explore TRENDORA edits — everyday essentials, resort pieces, city tailoring and finishing touches."
};

const COLLECTIONS = [
  {
    label: "Everyday",
    title: "The Everyday Edit",
    description:
      "Soft basics and easy layers in a warm, neutral palette. Made for school runs, studio days and late coffees.",
    href: "/shop?category=Women",
    image:
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1200&q=85",
    tone: "bg-[#F4EFE8]"
  },
  {
    label: "Resort",
    title: "Weekend in Zanzibar",
    description:
      "Lightweight dresses, swimwear and sand-ready accessories for the coast. Pack light, look effortless.",
    href: "/shop?category=Swimwear",
    image:
      "https://images.unsplash.com/photo-1608042314453-ae338d80c427?auto=format&fit=crop&w=1200&q=85",
    tone: "bg-[#E6F2F3]"
  },
  {
    label: "Tailoring",
    title: "City Tailoring",
    description:
      "Clean lines and relaxed structure for men. Trousers, denim and layers that move from desk to dinner.",
    href: "/shop?category=Men",
    image:
      "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=1200&q=85",
    tone: "bg-[#EEF0EA]"
  },
  {
    label: "Finishing touches",
    title: "The Accessory Room",
    description:
      "Bags, gold hoops and sunglasses — the pieces that quietly pull a whole look together.",
    href: "/shop?category=Accessories",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85",
    tone: "bg-[#F4EDEA]"
  }
];

export default async function CollectionsPage() {
  const db = await readDb();
  const active = db.products.filter((product) => product.isActive);
  const picks = [...active]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-800 text-white">
        <div className="absolute inset-0 hero-noise" aria-hidden="true" />
        <div className="container-shell relative py-14 sm:py-20">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-200">
            <span className="h-px w-8 bg-brand-400" />
            The Trendora edits
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-6xl">
            Collections with a point of view.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
            Four edits, one wardrobe. Each collection is built around pieces that
            work together and stay in rotation season after season.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-ink transition hover:bg-brand-50"
          >
            Shop all pieces
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="container-shell py-12 lg:py-16">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
          {COLLECTIONS.map((collection, index) => (
            <Link
              key={collection.title}
              href={collection.href}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200/70"
            >
              <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[5/4]">
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={index < 2}
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
                    {collection.label}
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-extrabold text-white sm:text-3xl">
                    {collection.title}
                  </h2>
                  <p className="mt-2 max-w-sm text-[11px] leading-relaxed text-white/70 sm:text-xs">
                    {collection.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-white">
                    Shop the edit
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-zinc-200/70 bg-[#F7F8F7]">
        <div className="container-shell py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Just landed</p>
              <h2 className="section-title mt-1.5">Pieces we&apos;re loving</h2>
            </div>
            <Link
              href="/shop?sort=newest"
              className="text-xs font-semibold text-brand-700 hover:underline"
            >
              View all new arrivals →
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {picks.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
