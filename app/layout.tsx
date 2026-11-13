import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/store-context";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: {
    default: "TRENDORA — Modern Fashion, Made for You",
    template: "%s | TRENDORA"
  },
  description:
    "Discover modern, considered fashion at TRENDORA. Shop women's, men's, dresses, shoes, bags and accessories with delivery across Tanzania.",
  keywords: [
    "Trendora",
    "Tanzania fashion",
    "online clothing Tanzania",
    "women's clothing",
    "men's clothing",
    "Dar es Salaam shopping"
  ],
  openGraph: {
    title: "TRENDORA — Modern Fashion, Made for You",
    description:
      "Modern, considered fashion with delivery across Tanzania. Pay in TZS with USD display.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans">
        <StoreProvider>
          <div className="flex min-h-screen flex-col">
            <AnnouncementBar />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
