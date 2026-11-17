import type { Metadata } from "next";
import { readDb } from "@/lib/db";
import { ShopClient } from "@/components/shop-client";
import { getTranslator } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getTranslator();
  return {
    title: tr("All products", "Bidhaa zote"),
    description: tr(
      "Shop clothes, shoes, bags and accessories. Filter by size, colour and price. Pay on delivery anywhere in Tanzania.",
      "Nunua nguo, viatu, mikoba na mapambo. Chuja kwa saizi, rangi na bei. Lipa ukipokea popote Tanzania."
    )
  };
}

export default async function ShopPage({
  searchParams
}: {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
  }>;
}) {
  const query = await searchParams;
  const db = await readDb();
  const products = db.products.filter((product) => product.isActive);

  return (
    <ShopClient
      key={`${query.category ?? ""}|${query.q ?? ""}|${query.sort ?? ""}`}
      products={products}
      initialCategory={query.category ?? ""}
      initialQuery={query.q ?? ""}
      initialSort={query.sort ?? "featured"}
    />
  );
}
