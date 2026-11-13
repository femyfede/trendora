import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Returns Policy",
  description: "How to return or exchange an item purchased from TRENDORA."
};

export default function ReturnsPage() {
  return (
    <PolicyPage
      kicker="Customer care"
      title="Returns Policy"
      updated="22 October 2026"
      intro="We want you to love what you ordered. If something isn't right, you can request a return within 14 days of delivery, provided the item is unworn, unwashed and still has its original tags."
      sections={[
        {
          title: "What can be returned",
          list: [
            "Unworn, unwashed clothing with original tags and packaging.",
            "Shoes that have only been tried on indoors, in their original box.",
            "Bags and accessories in unused condition with their protective packaging.",
            "Swimwear and earrings only if unused and in their sealed hygiene packaging.",
            "Items that arrived damaged, faulty or different from what you ordered."
          ]
        },
        {
          title: "What cannot be returned",
          list: [
            "Items returned after 14 days from delivery.",
            "Pieces that have been worn, washed, altered, damaged or had tags removed.",
            "Swimwear, earrings or other hygiene items without their sealed packaging.",
            "Final-sale or clearance items marked as non-returnable at the time of purchase.",
            "Gift cards and delivery charges, except where an item was faulty."
          ]
        },
        {
          title: "How to start a return",
          list: [
            "Email hello@trendora.co.tz or call +255 712 345 678 within 14 days of delivery.",
            "Include your order number, the item you want to return and the reason.",
            "Our team will confirm whether the return is approved and share the next steps.",
            "Pack the item securely with its tags and original packaging. Do not send cash.",
            "Return delivery is arranged with our team. Unless the item was faulty or incorrect, return delivery may be charged."
          ]
        },
        {
          title: "Refunds",
          paragraphs: [
            "Once we receive and inspect your return, we will email you the outcome. Approved refunds are usually processed within 5 – 10 business days. For Cash on Delivery orders, refunds are made by mobile money or bank transfer to details provided by you.",
            "Original delivery fees are not refunded unless the item was faulty, damaged or incorrect. If free delivery was offered because your order met the threshold, and a return takes the kept order below that threshold, the delivery cost may be deducted from the refund."
          ]
        },
        {
          title: "Exchanges",
          paragraphs: [
            "If you need a different size or colour, contact us first so we can hold the replacement if it is in stock. Exchanges are subject to availability. If the replacement is not available, we will offer a refund instead."
          ]
        },
        {
          title: "Faulty or incorrect items",
          paragraphs: [
            "If an item arrives damaged, faulty or incorrect, contact us within 48 hours of delivery with photos and your order number. We will arrange a replacement or refund, including any relevant delivery costs. Please do not wear or wash a faulty item before contacting us."
          ]
        }
      ]}
    />
  );
}
