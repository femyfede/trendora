import type { Metadata } from "next";
import { readDb } from "@/lib/db";
import { ShopClient } from "@/components/shop-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All",
  description:
    "Shop modern clothing, shoes, bags and accessories at TRENDORA. Filter by size, colour, price and availability. Delivery across Tanzania."
};

export default async function ShopPage({
  searchParams
}: {
  searchParams: {
    category?: string;
    q?: string;
    sort?: string;
  };
}) {
  const db = await readDb();
  const products = db.products.filter((product) => product.isActive);

  return (
    <ShopClient
      products={products}
      initialCategory={searchParams.category ?? ""}
      initialQuery={searchParams.q ?? ""}
      initialSort={searchParams.sort ?? "featured"}
    />
  );
}
