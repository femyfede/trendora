import type { Metadata } from "next";
import { CartClient } from "@/components/cart-client";
import { getTranslator } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getTranslator();
  return {
    title: tr("Your cart", "Kikapu chako"),
    description: tr("Review your cart and continue to checkout.", "Kagua kikapu chako kisha uendelee kulipia."),
    robots: { index: false, follow: false },
  };
}

export default function Page() {
  return <CartClient />;
}
