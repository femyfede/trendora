import { readDb } from "@/lib/db";
import { Hero } from "@/components/hero";
import { Benefits } from "@/components/benefits";
import { Categories } from "@/components/categories";
import { ProductGridSection } from "@/components/product-grid-section";
import { HowItWorks, PromoBanner, SellerSection } from "@/components/home-sections";
import { NewsletterSection } from "@/components/newsletter-section";
import type { PublicShop } from "@/components/shop-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = await readDb();
  const active = db.products.filter((product) => product.isActive);

  const bestSellers = active.filter((product) => product.isBestSeller).slice(0, 4);
  const fallbackBest = [...active].sort((a, b) => b.sold - a.sold).slice(0, 4);
  // Products hidden from the home page "New arrivals" section (still listed in the shop).
  const hiddenFromNewArrivals = new Set(["p-onepiece"]);
  const newArrivals = active
    .filter((product) => !hiddenFromNewArrivals.has(product.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const activeShops = db.shops.filter((shop) => shop.status === "ACTIVE");
  // Only public, non-sensitive shop fields are sent to the browser.
  const featuredShops: PublicShop[] = [...activeShops]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)
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
    <>
      <Hero />
      <Benefits />
      <Categories />
      {active.length > 0 && (
        <ProductGridSection
          kickerKey="sections.best.kicker"
          titleKey="sections.best.title"
          subtitleKey="sections.best.sub"
          products={bestSellers.length ? bestSellers : fallbackBest}
          footerCtaKey="sections.viewAll"
          footerCtaHref="/shop"
        />
      )}
      <HowItWorks />
      <SellerSection shops={featuredShops} shopCount={activeShops.length} />
      {active.length > 0 && (
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
      )}
      <PromoBanner />
      <NewsletterSection />
    </>
  );
}
