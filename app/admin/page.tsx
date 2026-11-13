import type { Metadata } from "next";
import { AdminClient } from "@/components/admin/admin-client";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage TRENDORA products, inventory, orders and discounts.",
  robots: { index: false, follow: false }
};

export default function AdminPage() {
  return <AdminClient />;
}
