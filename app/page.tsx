import { readDb } from "@/lib/db";
import { Hero } from "@/components/hero";
import { Benefits } from "@/components/benefits";
import { Categories } from "@/components/categories";
import { ProductGridSection } from "@/components/product-grid-section";
import { PromoBanner } from "@/components/promo-banner";
import { NewsletterSection } from "@/components/newsletter-section";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = await readDb();
  const active = db.products.filter((product) => product.isActive);

  const bestSellers = active.filter((product) => product.isBestSeller).slice(0, 4);
  const newArrivals = [...active]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  const fallbackBest = [...active]
    .sort((a: Product, b: Product) => b.sold - a.sold)
    .slice(0, 4);

  return (
    <>
      <Hero />
      <Benefits />
      <Categories />
      <ProductGridSection
        kickerKey="sections.best.kicker"
        titleKey="sections.best.title"
        subtitleKey="sections.best.sub"
        products={bestSellers.length ? bestSellers : fallbackBest}
        footerCtaKey="sections.viewAll"
        footerCtaHref="/shop"
      />
      <ProductGridSection
        kickerKey="sections.new.kicker"
        titleKey="sections.new.title"
        subtitleKey="sections.new.sub"
        products={newArrivals}
        ctaKey="sections.new.cta"
        ctaHref="/shop?sort=newest"
        align="left"
        muted
        showNewCta
      />
      <PromoBanner />
      <NewsletterSection />
    </>
  );
}
