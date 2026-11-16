import type { Metadata } from "next";
import { CreateShopClient } from "@/components/create-shop-client";

export const metadata: Metadata = {
  title: "Fungua Duka Lako",
  description: "Omba kufungua duka lako la biashara nchini Tanzania."
};

export default function CreateShopPage() {
  return <CreateShopClient />;
}
