import { NextResponse } from "next/server";
import { mutateDb, readDb } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/constants";
import type { Order } from "@/lib/types";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import { canViewOrder } from "@/lib/order-access";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await readDb();
  const order = db.orders.find((item) => item.id === id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  const admin = await isAdmin();
  const user = admin ? null : await getCurrentUser();
  const accessToken = new URL(request.url).searchParams.get("access");
  if (!canViewOrder(order, { admin, userId: user?.id, accessToken })) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { accessTokenHash, ...publicOrder } = order;
  return NextResponse.json(publicOrder);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as { status?: string };
    if (!body.status || !ORDER_STATUSES.includes(body.status as Order["status"])) {
      return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
    }

    const updated = await mutateDb((db) => {
      const order = db.orders.find((item) => item.id === id);
      if (!order) return null;

      if (body.status === "cancelled" && order.status !== "cancelled") {
        // Cancelling returns the reserved stock.
        for (const item of order.items) {
          const product = db.products.find((entry) => entry.id === item.productId);
          if (product) product.stock += item.qty;
        }
      } else if (body.status !== "cancelled" && order.status === "cancelled") {
        // Re-opening a cancelled order reserves the stock again.
        for (const item of order.items) {
          const product = db.products.find((entry) => entry.id === item.productId);
          if (product) product.stock = Math.max(0, product.stock - item.qty);
        }
      }
      order.status = body.status as Order["status"];
      return order;
    });

    if (!updated) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    await sendOrderStatusUpdateEmail(updated).catch(() => undefined);

    const { accessTokenHash, ...publicOrder } = updated;
    return NextResponse.json({ order: publicOrder });
  } catch {
    return NextResponse.json({ error: "Could not update order." }, { status: 500 });
  }
}
