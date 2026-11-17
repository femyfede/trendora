import type { Metadata } from "next";
import { CreateShopClient } from "@/components/create-shop-client";
import { getTranslator } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getTranslator();
  return {
    title: tr("Register Your Shop", "Sajili Duka Lako"),
    description: tr("Register your shop so customers across Tanzania can find you.", "Sajili duka lako ili wateja kote Tanzania wakupate."),
  };
}

export default function Page() {
  return <CreateShopClient />;
}
