import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/store-context";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { getLanguage } from "@/lib/i18n-server";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const language = await getLanguage();
  const sw = language === "sw";
  const title = sw
    ? "TRENDORA: Nunua mitindo na maduka ya Tanzania mtandaoni"
    : "TRENDORA: Shop Tanzanian fashion and local shops online";
  const description = sw
    ? "Nunua nguo, viatu, mikoba na mapambo kutoka kwa wauzaji wa Tanzania. Lipa ukipokea, tunafikisha mikoa yote. Wafanyabiashara: sajili duka lako leo."
    : "Shop clothes, shoes, bags and accessories from Tanzanian sellers. Pay on delivery, with delivery to every region. Business owners: register your shop today.";
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://trendora.co.tz"),
    title: { default: title, template: "%s | TRENDORA" },
    description,
    keywords: [
      "Trendora",
      "maduka Tanzania",
      "nunua mtandaoni Tanzania",
      "nguo Dar es Salaam",
      "Tanzania online shopping",
      "Tanzania fashion",
      "sajili duka"
    ],
    openGraph: {
      title,
      description,
      type: "website",
      locale: sw ? "sw_TZ" : "en_TZ",
      siteName: "TRENDORA"
    },
    alternates: { languages: { sw: "/", en: "/" } }
  };
}

export const viewport: Viewport = {
  themeColor: "#0E5F6D",
  width: "device-width",
  initialScale: 1
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const language = await getLanguage();
  return (
    <html lang={language} className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans">
        <StoreProvider initialLanguage={language}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lift"
          >
            {language === "sw" ? "Ruka hadi maudhui" : "Skip to content"}
          </a>
          <div className="flex min-h-screen flex-col">
            <AnnouncementBar />
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <MobileNav />
        </StoreProvider>
      </body>
    </html>
  );
}
