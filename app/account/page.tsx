import type { Metadata } from "next";
import { AccountClient } from "@/components/account-client";
import { getTranslator } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getTranslator();
  return {
    title: tr("My Account", "Akaunti Yangu"),
    description: tr("Log in or create your TRENDORA account.", "Ingia au fungua akaunti yako ya TRENDORA."),
    robots: { index: false, follow: false },
  };
}

export default function Page() {
  return <AccountClient />;
}
