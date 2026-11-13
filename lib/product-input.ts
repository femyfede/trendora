import type { Category, Color, Product } from "./types";
import { CATEGORIES } from "./constants";
import { slugify, uid } from "./utils";

type ProductBody = {
  name?: string;
  slug?: string;
  category?: string;
  brand?: string;
  description?: string;
  material?: string;
  details?: string[] | string;
  price?: number | string;
  compareAtPrice?: number | string | null;
  images?: string[] | string;
  sizes?: string[] | string;
  colors?: Color[] | string;
  rating?: number | string;
  reviewCount?: number | string;
  sold?: number | string;
  stock?: number | string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  createdAt?: string;
};

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string")
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  return [];
}

const HEX_FALLBACKS: Record<string, string> = {
  black: "#141414",
  white: "#F2EFE8",
  ivory: "#F2EFE8",
  teal: "#0E5F6D",
  sand: "#D8C6AF",
  olive: "#6E7357",
  blush: "#E5B7AE",
  rose: "#C98A93",
  sky: "#AFC8DC",
  blue: "#53718C",
  gold: "#C7A86B",
  red: "#B23A3A",
  brown: "#7A5C45",
  grey: "#8A8F91",
  gray: "#8A8F91",
  navy: "#223A52",
  pink: "#E5B7AE"
};

function toColors(value: unknown): Color[] {
  if (Array.isArray(value)) {
    return value
      .map((raw) => {
        if (typeof raw === "string")
          return {
            name: raw,
            hex: HEX_FALLBACKS[raw.toLowerCase()] || "#8A8F91"
          };
        if (raw && typeof raw === "object") {
          const item = raw as Color;
          if (typeof item.name !== "string") return null;
          return {
            name: item.name,
            hex:
              typeof item.hex === "string" && /^#[0-9a-fA-F]{3,8}$/.test(item.hex)
                ? item.hex
                : HEX_FALLBACKS[item.name.toLowerCase()] || "#8A8F91"
          };
        }
        return null;
      })
      .filter((item): item is Color => Boolean(item && item.name));
  }
  if (typeof value === "string")
    return toList(value).map((name) => ({
      name,
      hex: HEX_FALLBACKS[name.toLowerCase()] || "#8A8F91"
    }));
  return [];
}

export function parseProductInput(
  body: ProductBody,
  existing?: Product
): { product?: Product; error?: string } {
  const name = String(body.name ?? existing?.name ?? "").trim();
  if (!name) return { error: "Product name is required." };

  const category = String(body.category ?? existing?.category ?? "") as Category;
  if (!CATEGORIES.some((item) => item.value === category))
    return { error: "Choose a valid category." };

  const price = toNumber(body.price ?? existing?.price, 0);
  if (price <= 0) return { error: "Price must be greater than zero." };

  const images = toList(body.images ?? existing?.images ?? []);
  if (!images.length) return { error: "Add at least one image URL." };

  const sizes = toList(body.sizes ?? existing?.sizes ?? []);
  if (!sizes.length) return { error: "Add at least one size." };

  const colors = toColors(body.colors ?? existing?.colors);
  if (!colors.length) return { error: "Add at least one colour." };

  const slugBase = slugify(String(body.slug || name));
  const createdAt = body.createdAt || existing?.createdAt || new Date().toISOString();

  const product: Product = {
    id: existing?.id ?? `p-${uid()}`,
    slug: slugBase || `product-${Date.now()}`,
    name,
    category,
    brand: String(body.brand ?? existing?.brand ?? "TRENDORA").trim() || "TRENDORA",
    description:
      String(body.description ?? existing?.description ?? "").trim() ||
      "A modern TRENDORA piece designed to be worn on repeat.",
    material: String(body.material ?? existing?.material ?? "").trim() || "See care label",
    details: toList(body.details ?? existing?.details ?? []),
    price: Math.round(price),
    compareAtPrice:
      body.compareAtPrice === null || body.compareAtPrice === ""
        ? null
        : Math.max(
            existing?.compareAtPrice ?? 0,
            toNumber(body.compareAtPrice ?? existing?.compareAtPrice ?? 0, 0)
          ) > price
          ? Math.round(toNumber(body.compareAtPrice ?? existing?.compareAtPrice ?? 0, 0))
          : null,
    images,
    sizes,
    colors,
    rating: Math.min(5, Math.max(0, toNumber(body.rating ?? existing?.rating, 4.5))),
    reviewCount: Math.max(0, Math.round(toNumber(body.reviewCount ?? existing?.reviewCount, 0))),
    sold: Math.max(0, Math.round(toNumber(body.sold ?? existing?.sold, 0))),
    stock: Math.max(0, Math.round(toNumber(body.stock ?? existing?.stock, 0))),
    isNew: Boolean(body.isNew ?? existing?.isNew ?? false),
    isBestSeller: Boolean(body.isBestSeller ?? existing?.isBestSeller ?? false),
    isActive: Boolean(body.isActive ?? existing?.isActive ?? true),
    createdAt
  };

  return { product };
}

export function uniqueSlug(
  product: Product,
  products: Product[]
): string {
  let slug = product.slug;
  let counter = 1;
  while (products.some((item) => item.slug === slug && item.id !== product.id)) {
    slug = `${product.slug}-${counter}`;
    counter += 1;
  }
  return slug;
}
