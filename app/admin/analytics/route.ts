import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const db = await readDb();
  const orders = db.orders;
  const products = db.products;
  const now = Date.now();
  const thirtyDaysAgo = now - 1000 * 60 * 60 * 24 * 30;

  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const recentOrders = orders.filter(
    (o) => new Date(o.createdAt).getTime() >= thirtyDaysAgo
  );
  const recentRevenue = recentOrders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue =
    validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

  const revenueByDay: { date: string; revenue: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now - i * 1000 * 60 * 60 * 24);
    day.setHours(0, 0, 0, 0);
    const dayRevenue = orders
      .filter(
        (o) =>
          new Date(o.createdAt).getTime() >= day.getTime() &&
          new Date(o.createdAt).getTime() < day.getTime() + 1000 * 60 * 60 * 24
      )
      .reduce((sum, o) => sum + o.total, 0);
    revenueByDay.push({
      date: day.toISOString().slice(0, 10),
      revenue: dayRevenue
    });
  }

  const productRevenueMap = new Map<string, { name: string; sold: number; revenue: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const existing = productRevenueMap.get(item.productId);
      if (existing) {
        existing.sold += item.qty;
        existing.revenue += item.price * item.qty;
      } else {
        const product = products.find((p) => p.id === item.productId);
        productRevenueMap.set(item.productId, {
          name: item.name,
          sold: item.qty,
          revenue: item.price * item.qty
        });
      }
    }
  }
  const topProducts = Array.from(productRevenueMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const ordersByStatus: Record<string, number> = {};
  for (const order of orders) {
    ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
  }

  const newCustomers = new Set(
    orders.map((o) => o.customer.email)
  ).size;

  return NextResponse.json({
    overview: {
      totalRevenue,
      recentRevenue,
      totalOrders: orders.length,
      recentOrders: recentOrders.length,
      averageOrderValue,
      conversionRate: orders.length > 0 ? Math.round((validOrders.length / orders.length) * 100) : 0,
      newCustomers
    },
    revenueByDay,
    topProducts,
    ordersByStatus,
    lowStockProducts: products
      .filter((p) => p.stock <= 5 && p.isActive)
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        stock: p.stock
      }))
  });
}
