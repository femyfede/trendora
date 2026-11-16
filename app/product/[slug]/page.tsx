import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import { ProductDetail } from "@/components/product-detail";
import { ProductReviews } from "@/components/product-reviews";

export const dynamic = "force-dynamic";

async function getProduct(slug: string) {
  const db = await readDb();
  return db.products.find(
    (product) => product.slug === slug && product.isActive
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: `${product.description.slice(0, 150)} Shop ${product.name} at TRENDORA with delivery across Tanzania.`,
    openGraph: {
      title: `${product.name} | TRENDORA`,
      description: product.description.slice(0, 160),
      images: [{ url: product.images[0] }]
    }
  };
}

export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = await readDb();
  const product = db.products.find(
    (item) => item.slug === slug && item.isActive
  );
  if (!product) notFound();

  const active = db.products.filter((item) => item.isActive);
  const sameCategory = active.filter(
    (item) => item.id !== product.id && item.category === product.category
  );
  const fallback = active
    .filter(
      (item) =>
        item.id !== product.id &&
        !sameCategory.some((entry) => entry.id === item.id)
    )
    .sort((a, b) => b.sold - a.sold);
  const related = [...sameCategory, ...fallback].slice(0, 4);

  return (
    <>
      <ProductDetail product={product} related={related} />
      <ProductReviews productId={product.id} initialRating={product.rating} initialReviewCount={product.reviewCount} />
    </>
  );
}
