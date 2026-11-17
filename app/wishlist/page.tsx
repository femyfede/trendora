import type { Metadata } from "next";
import { WishlistClient } from "@/components/wishlist-client";
import { getTranslator } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getTranslator();
  return {
    title: tr("Saved items", "Nilivyopenda"),
    description: tr("Products you have saved.", "Bidhaa ulizohifadhi."),
    robots: { index: false, follow: false },
  };
}

export default function Page() {
  return <WishlistClient />;
}
