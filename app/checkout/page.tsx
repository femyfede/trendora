import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout-client";
import { getTranslator } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getTranslator();
  return {
    title: tr("Checkout", "Kulipia"),
    description: tr("Complete your order. Delivery to every region of Tanzania.", "Kamilisha oda yako. Tunafikisha mikoa yote ya Tanzania."),
    robots: { index: false, follow: false },
  };
}

export default function Page() {
  return <CheckoutClient />;
}
