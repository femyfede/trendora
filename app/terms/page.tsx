import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply when you shop with TRENDORA."
};

export default function TermsPage() {
  return (
    <PolicyPage
      kicker="Legal"
      title="Terms & Conditions"
      updated="22 October 2026"
      intro="These terms govern your use of the TRENDORA website and your purchases from us. By using the site or placing an order, you agree to these terms. Please read them carefully."
      sections={[
        {
          title: "About TRENDORA",
          paragraphs: [
            "TRENDORA is an online clothing and fashion store based in Dar es Salaam, Tanzania. References to “we”, “us” and “our” mean TRENDORA. Our customer support details are listed at the bottom of this page."
          ]
        },
        {
          title: "Products and pricing",
          paragraphs: [
            "We work hard to display product colours and details accurately, but screens vary and small differences can occur. Prices are shown in Tanzanian shillings (TZS) as the primary currency. USD values are provided for convenience only and are recalculated at a reference rate.",
            "We may change prices, run promotions or correct pricing errors at any time. If an obvious pricing error affects your order, we will contact you before dispatch and offer to cancel or confirm the corrected price."
          ]
        },
        {
          title: "Orders and acceptance",
          paragraphs: [
            "Your order is an offer to purchase. We confirm acceptance when we send your order confirmation. All orders are subject to stock availability and payment method availability. If an item becomes unavailable after you order, we will contact you to arrange a refund or alternative.",
            "You are responsible for providing accurate contact and delivery information. Please check your details carefully at checkout."
          ]
        },
        {
          title: "Payments",
          paragraphs: [
            "Cash on Delivery is currently available within Tanzania. A demo test payment option is available in this environment; it is clearly labelled as a sandbox and makes no real charge.",
            "M-Pesa, Mixx by Yas and Airtel Money are not active yet. We will only accept those payment methods after their integrations have been completed and tested, and will update the site when they go live.",
            "Never send mobile-money PINs or card details by email, WhatsApp or social media."
          ]
        },
        {
          title: "Delivery",
          paragraphs: [
            "Delivery fees and estimated timelines are shown at checkout based on your region. Delivery timelines are estimates and can be affected by weather, public holidays or events outside our control.",
            "Someone at the delivery address should be available to receive the order. For Cash on Delivery, please have the correct amount ready where possible."
          ]
        },
        {
          title: "Returns and exchanges",
          paragraphs: [
            "Our Returns Policy forms part of these terms. In summary, eligible unworn items with original tags can be returned within 14 days of delivery. Hygiene-sensitive items such as swimwear and earrings must be returned unused and in their original protective packaging."
          ]
        },
        {
          title: "Accounts and acceptable use",
          list: [
            "Keep your password confidential and tell us promptly if you suspect unauthorised access.",
            "Do not use the site to submit false orders, abuse promotions, scrape data or interfere with its operation.",
            "We may suspend or close accounts that breach these terms or are used for fraudulent activity."
          ]
        },
        {
          title: "Intellectual property",
          paragraphs: [
            "The TRENDORA name, logo, brand identity, product photography and site design are owned by or licensed to TRENDORA. You may not copy or reuse them for commercial purposes without written permission."
          ]
        },
        {
          title: "Limitation of liability",
          paragraphs: [
            "To the extent permitted by law, TRENDORA is not liable for indirect or consequential losses arising from use of the site. Nothing in these terms excludes rights you have under applicable Tanzanian consumer law."
          ]
        },
        {
          title: "Governing law and changes",
          paragraphs: [
            "These terms are governed by the laws of Tanzania. We may update these terms from time to time; the version published on this page applies to new orders. If any provision is found unenforceable, the remaining provisions continue to apply."
          ]
        }
      ]}
    />
  );
}
