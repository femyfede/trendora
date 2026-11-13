import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How TRENDORA collects, uses and protects your personal information."
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      kicker="Legal"
      title="Privacy Policy"
      updated="22 October 2026"
      intro="TRENDORA respects your privacy. This policy explains what information we collect when you shop with us, why we need it, and the choices you have. It applies to trendora.co.tz and our related customer services."
      sections={[
        {
          title: "Information we collect",
          paragraphs: [
            "We collect information you provide directly to us, including when you create an account, place an order, subscribe to our newsletter or contact support."
          ],
          list: [
            "Contact details such as your name, email address and phone number.",
            "Delivery details such as your country, region, city, street address and delivery notes.",
            "Order information, including the products, sizes, colours and quantities you purchase.",
            "Account information. Passwords are stored only as salted, one-way hashes.",
            "Communications you send us and newsletter subscription preferences."
          ]
        },
        {
          title: "How we use your information",
          list: [
            "To process, pack, deliver and support your orders.",
            "To send order confirmations, delivery updates and respond to enquiries.",
            "To operate your account and keep your wishlist available on your device.",
            "To prevent fraud, maintain inventory accuracy and improve our service.",
            "To send marketing emails where you have opted in. You can unsubscribe at any time."
          ]
        },
        {
          title: "Payments",
          paragraphs: [
            "Cash on Delivery is currently available. Mobile money services such as M-Pesa, Mixx by Yas and Airtel Money are shown for planning only and are not active until their integrations are completed and tested.",
            "When mobile money or card payments are enabled, payment credentials will be handled by the relevant payment provider. TRENDORA will not store full card numbers or mobile-money PINs on its servers."
          ]
        },
        {
          title: "Cookies and local storage",
          paragraphs: [
            "We use a secure HTTP-only cookie to keep signed-in sessions active. Your cart, wishlist, language and display currency are stored in your browser's local storage so they survive a page refresh. These are not used for third-party advertising."
          ]
        },
        {
          title: "Sharing your information",
          paragraphs: [
            "We share information only with service providers that help us operate the store, such as delivery partners and hosting providers, and only as needed to fulfil your order or comply with the law. We do not sell your personal information."
          ]
        },
        {
          title: "Your choices and rights",
          list: [
            "You can request access to, correction of, or deletion of your personal information.",
            "You can unsubscribe from marketing emails using the link in any email or by contacting us.",
            "You can clear your cart and wishlist at any time by clearing your browser storage.",
            "You may contact us to close your account."
          ]
        },
        {
          title: "Data retention and security",
          paragraphs: [
            "We keep order records for as long as needed to provide warranty, returns and accounting support. Passwords are hashed, sessions are signed, and account cookies are HTTP-only. No online system is completely secure, so please use a unique password and avoid sharing it."
          ]
        },
        {
          title: "Children",
          paragraphs: [
            "Our store is intended for customers aged 18 and over. We do not knowingly collect personal information from children."
          ]
        },
        {
          title: "Changes to this policy",
          paragraphs: [
            "We may update this policy as the store grows or as payment and delivery integrations are added. The date at the top of this page shows when it was last revised."
          ]
        }
      ]}
    />
  );
}
