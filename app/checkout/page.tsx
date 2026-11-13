import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your TRENDORA order with delivery across Tanzania."
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
