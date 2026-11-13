import type { Metadata } from "next";
import { CartClient } from "@/components/cart-client";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your TRENDORA cart and proceed to secure checkout."
};

export default function CartPage() {
  return <CartClient />;
}
