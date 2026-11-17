import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { readDb } from "@/lib/db";
import { getTranslator } from "@/lib/i18n-server";
import { IMAGES } from "@/lib/constants";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getTranslator();
  return {
    title: tr("Collections", "Mikusanyiko"),
    description: tr(
      "Everyday wear, coastal style, smart menswear and accessories, curated for Tanzania.",
      "Mavazi ya kila siku, mitindo ya pwani, mavazi ya kiume na mapambo, yaliyochaguliwa kwa ajili ya Tanzania."
    )
  };
}

export default async function CollectionsPage() {
  const [{ tr }, db] = await Promise.all([getTranslator(), readDb()]);
  const picks = db.products
    .filter((product) => product.isActive)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const collections = [
    {
      label: tr("Everyday", "Kila siku"),
      title: tr("The everyday edit", "Mavazi ya kila siku"),
      description: tr(
        "Comfortable, colourful pieces for work, church, mosque and weekends with family.",
        "Nguo za starehe na rangi nzuri kwa kazini, ibadani na wikendi na familia."
      ),
      href: "/shop?category=Women",
      image: IMAGES.headwrap,
      alt: tr("A woman wearing a bright kitenge head wrap", "Mwanamke aliyevaa kilemba cha kitenge chenye rangi angavu")
    },
    {
      label: tr("Coast", "Pwani"),
      title: tr("A weekend in Zanzibar", "Wikendi Zanzibar"),
      description: tr(
        "Light dresses, kanga and beachwear for the coast. Pack light, look good.",
        "Magauni mepesi, kanga na mavazi ya ufukweni. Beba vichache, pendeza zaidi."
      ),
      href: "/shop?category=Swimwear",
      image: IMAGES.beach,
      alt: tr("Women in colourful kanga on a Zanzibar beach", "Wanawake waliovaa kanga za rangi ufukweni Zanzibar")
    },
    {
      label: tr("Menswear", "Wanaume"),
      title: tr("Smart for the city", "Nadhifu mjini"),
      description: tr(
        "Shirts, trousers and layers that take you from the office to dinner.",
        "Mashati, suruali na koti zinazokufaa kuanzia ofisini hadi jioni."
      ),
      href: "/shop?category=Men",
      image: IMAGES.menStyle,
      alt: tr("A well-dressed man in a jacket and tie", "Mwanaume aliyevaa koti na tai kwa unadhifu")
    },
    {
      label: tr("Finishing touches", "Mapambo"),
      title: tr("Beads, bags and more", "Shanga, mikoba na zaidi"),
      description: tr(
        "Handmade beadwork, bags and accessories that complete your look.",
        "Shanga za mikono, mikoba na mapambo yanayokamilisha mtindo wako."
      ),
      href: "/shop?category=Accessories",
      image: IMAGES.beads,
      alt: tr("Colourful beaded necklaces hanging at a market stall", "Mikufu ya shanga za rangi ikining'inia bandani sokoni")
    }
  ];

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <Image src={IMAGES.fabrics} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
        <div className="container-shell relative py-14 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sun-400">{tr("Collections", "Mikusanyiko")}</p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {tr("Find a style for every day.", "Pata mtindo wa kila siku.")}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/85">
            {tr(
              "Four collections, chosen to work together and suit life in Tanzania.",
              "Mikusanyiko minne, iliyochaguliwa kuendana na maisha ya Kitanzania."
            )}
          </p>
          <Link href="/shop" className="btn-white mt-7">
            {tr("See all products", "Tazama bidhaa zote")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="container-shell py-12 lg:py-16">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
          {collections.map((collection, index) => (
            <Link key={collection.href} href={collection.href} className="group relative overflow-hidden rounded-3xl">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={collection.image}
                  alt={collection.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={index < 2}
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-sun-400">{collection.label}</p>
                  <h2 className="mt-1.5 font-display text-2xl font-extrabold text-white sm:text-3xl">{collection.title}</h2>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/85">{collection.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-white">
                    {tr("Shop now", "Nunua sasa")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {picks.length > 0 && (
        <section className="border-t border-zinc-200/70 bg-sand">
          <div className="container-shell py-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="section-kicker">{tr("Just arrived", "Zimefika sasa hivi")}</p>
                <h2 className="section-title mt-1.5">{tr("New this month", "Mpya mwezi huu")}</h2>
              </div>
              <Link href="/shop?sort=newest" className="text-sm font-semibold text-brand-700 hover:underline">
                {tr("See all new arrivals", "Tazama bidhaa mpya zote")} →
              </Link>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {picks.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
