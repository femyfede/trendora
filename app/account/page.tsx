import type { Metadata } from "next";
import { AccountClient } from "@/components/account-client";

export const metadata: Metadata = {
  title: "My Account",
  description: "Sign in or create your TRENDORA account."
};

export default function AccountPage() {
  return <AccountClient />;
}
