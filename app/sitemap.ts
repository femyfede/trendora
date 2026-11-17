import type { MetadataRoute } from "next";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://trendora.co.tz";
  const pages = ["", "/shop", "/shops", "/collections", "/about", "/contact", "/create-shop", "/privacy", "/terms", "/returns"].map(
    (path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 })
  );
  try {
    const db = await readDb();
    const products = db.products
      .filter((product) => product.isActive)
      .map((product) => ({ url: `${base}/product/${product.slug}`, changeFrequency: "weekly" as const, priority: 0.6 }));
    return [...pages, ...products];
  } catch {
    return pages;
  }
}
