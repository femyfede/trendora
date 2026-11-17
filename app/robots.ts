import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://trendora.co.tz";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/account", "/cart", "/checkout", "/order/"] }],
    sitemap: `${base}/sitemap.xml`
  };
}
