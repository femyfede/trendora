import type { Metadata } from "next";
import { WishlistClient } from "@/components/wishlist-client";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Pieces you have saved at TRENDORA."
};

export default function WishlistPage() {
  return <WishlistClient />;
}
