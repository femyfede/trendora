import { clsx, type ClassValue } from "clsx";
import { FREE_SHIPPING_THRESHOLD, USD_RATE } from "./constants";
import type { Currency, Language, Product } from "./types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatTZS(amount: number) {
  return `TZS ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(Math.round(amount))}`;
}

export function formatUSD(amount: number) {
  return `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount / USD_RATE)}`;
}

export function formatPrice(amount: number, currency: Currency = "TZS") {
  return currency === "USD" ? formatUSD(amount) : formatTZS(amount);
}

export function formatDate(iso: string, language: Language = "en") {
  return new Intl.DateTimeFormat(language === "sw" ? "sw-TZ" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(iso));
}

export function discountPercent(product: Pick<Product, "price" | "compareAtPrice">) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
  return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
}

export function stockLabel(stock: number, language: Language = "en") {
  if (stock <= 0) return language === "sw" ? "Imeisha" : "Sold out";
  if (stock <= 5)
    return language === "sw" ? `Zimebaki ${stock} tu` : `Only ${stock} left`;
  return language === "sw" ? "Ipo" : "In stock";
}

export function stockTone(stock: number) {
  if (stock <= 0) return "text-zinc-400";
  if (stock <= 5) return "text-amber-600";
  return "text-emerald-700";
}

export function isFreeShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}

export function shippingProgress(subtotal: number) {
  return Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function uid(prefix = "") {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}${Date.now().toString(36)}${random}`.toLowerCase();
}

export function orderId() {
  return `TRD-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.random()
    .toString(36)
    .toUpperCase()
    .slice(2, 5)}`;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function isValidTzPhone(value: string) {
  const clean = value.replace(/[\s-]/g, "");
  return /^(\+?255|0)[67]\d{8}$/.test(clean) || /^\+?\d{9,15}$/.test(clean);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function paramCategory(value: string | null): string {
  return value ? decodeURIComponent(value) : "";
}

/** Converts a Tanzanian number (07…, +2557…, 2557…) into the digits WhatsApp links expect. */
export function whatsappNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) return `255${digits.slice(1)}`;
  return digits;
}

export function telHref(value: string) {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

/**
 * Case-insensitive product search across name, brand, category and the
 * category's Kiswahili name, so "viatu" finds shoes and "gauni" finds dresses.
 */
export function matchesSearch(
  product: Pick<Product, "name" | "brand" | "category" | "description">,
  query: string
) {
  const value = query.trim().toLowerCase();
  if (!value) return true;
  const category = CATEGORY_SEARCH_TERMS[product.category] ?? "";
  const haystack = `${product.name} ${product.brand} ${product.category} ${category} ${product.description}`.toLowerCase();
  return value.split(/\s+/).every((word) => haystack.includes(word));
}

const CATEGORY_SEARCH_TERMS: Record<string, string> = {
  Women: "wanawake mwanamke kike",
  Men: "wanaume mwanaume kiume",
  Dresses: "gauni magauni dress",
  "Crop Tops": "blauzi blausi top tops shati",
  Shoes: "viatu kiatu sandals raba",
  Bags: "mkoba mikoba begi",
  Accessories: "mapambo hereni cheni bangili miwani",
  Swimwear: "pwani kuogelea ufukweni beach"
};
