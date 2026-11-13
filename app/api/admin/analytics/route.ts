import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { getCurrentUser, hasRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await hasRole("admin", "manager");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const db = await readDb();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const validOrders = db.orders.filter((o) => o.status !== "cancelled");
    const recentOrders = validOrders.filter((o) => new Date(o.createdAt) >= thirtyDaysAgo);
    const lastWeekOrders = validOrders.filter((o) => new Date(o.createdAt) >= sevenDaysAgo);

    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const recentRevenue = recentOrders.reduce((sum, o) => sum + o.total, 0);
    const lastWeekRevenue = lastWeekOrders.reduce((sum, o) => sum + o.total, 0);

    const revenueByDay: Record<string, number> = {};
    for (const order of recentOrders) {
      const day = new Date(order.createdAt).toISOString().split("T")[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + order.total;
    }

    const topProducts: Record<string, { name: string; sold: number; revenue: number }> = {};
    for (const order of validOrders) {
      for (const item of order.items) {
        if (!topProducts[item.productId]) {
          topProducts[item.productId] = { name: item.name, sold: 0, revenue: 0 };
        }
        topProducts[item.productId].sold += item.qty;
        topProducts[item.productId].revenue += item.price * item.qty;
      }
    }

    const topProductsSorted = Object.entries(topProducts)
      .sort(([, a], [, b]) => b.sold - a.sold)
      .slice(0, 10)
      .map(([id, data]) => ({ productId: id, ...data }));

    const ordersByStatus: Record<string, number> = {};
    for (const order of db.orders) {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    }

    const newCustomers = db.users.filter(
      (u) => u.role === "customer" && new Date(u.createdAt) >= thirtyDaysAgo
    ).length;

    const lowStockProducts = db.products
      .filter((p) => p.isActive && p.stock <= 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10);

    const conversionData = {
      totalVisitors: db.products.length * 50,
      totalOrders: validOrders.length,
      conversionRate: validOrders.length / (db.products.length * 50) * 100
    };

    return NextResponse.json({
      overview: {
        totalRevenue,
        recentRevenue,
        lastWeekRevenue,
        totalOrders: validOrders.length,
        recentOrders: recentOrders.length,
        averageOrderValue: validOrders.length ? Math.round(totalRevenue / validOrders.length) : 0,
        newCustomers,
        conversionRate: conversionData.conversionRate.toFixed(2)
      },
      revenueByDay: Object.entries(revenueByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, revenue]) => ({ date, revenue })),
      topProducts: topProductsSorted,
      ordersByStatus,
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        category: p.category
      }))
    });
  } catch {
    return NextResponse.json({ error: "Could not fetch analytics" }, { status: 500 });
  }
}