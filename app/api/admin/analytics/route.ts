import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const db = await readDb();
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * DAY;
    const sevenDaysAgo = now - 7 * DAY;

    const validOrders = db.orders.filter((order) => order.status !== "cancelled");
    const recentOrders = validOrders.filter((order) => new Date(order.createdAt).getTime() >= thirtyDaysAgo);
    const lastWeekOrders = validOrders.filter((order) => new Date(order.createdAt).getTime() >= sevenDaysAgo);
    const completedOrders = db.orders.filter((order) => order.status === "completed");

    const sum = (orders: typeof validOrders) => orders.reduce((total, order) => total + order.total, 0);
    const totalRevenue = sum(validOrders);

    const revenueByDay: Record<string, number> = {};
    for (const order of recentOrders) {
      const day = new Date(order.createdAt).toISOString().slice(0, 10);
      revenueByDay[day] = (revenueByDay[day] || 0) + order.total;
    }

    const topProducts: Record<string, { name: string; sold: number; revenue: number }> = {};
    for (const order of validOrders) {
      for (const item of order.items) {
        topProducts[item.productId] ??= { name: item.name, sold: 0, revenue: 0 };
        topProducts[item.productId].sold += item.qty;
        topProducts[item.productId].revenue += item.price * item.qty;
      }
    }

    const ordersByStatus: Record<string, number> = {};
    for (const order of db.orders) {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
    }

    return NextResponse.json({
      overview: {
        totalRevenue,
        recentRevenue: sum(recentOrders),
        lastWeekRevenue: sum(lastWeekOrders),
        totalOrders: validOrders.length,
        recentOrders: recentOrders.length,
        averageOrderValue: validOrders.length ? Math.round(totalRevenue / validOrders.length) : 0,
        newCustomers: db.users.filter(
          (user) => user.role === "customer" && new Date(user.createdAt).getTime() >= thirtyDaysAgo
        ).length,
        // Share of all orders that reached "completed". Visitor tracking does not exist,
        // so no visitor-based conversion rate is reported.
        completionRate: db.orders.length
          ? Math.round((completedOrders.length / db.orders.length) * 100)
          : 0
      },
      revenueByDay: Object.entries(revenueByDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, revenue]) => ({ date, revenue })),
      topProducts: Object.entries(topProducts)
        .sort(([, a], [, b]) => b.sold - a.sold)
        .slice(0, 10)
        .map(([productId, data]) => ({ productId, ...data })),
      ordersByStatus,
      lowStockProducts: db.products
        .filter((product) => product.isActive && product.stock <= 10)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 10)
        .map((product) => ({
          id: product.id,
          name: product.name,
          stock: product.stock,
          category: product.category
        }))
    });
  } catch {
    return NextResponse.json({ error: "Could not fetch analytics." }, { status: 500 });
  }
}
