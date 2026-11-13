import { NextResponse } from "next/server";
import { mutateDb, readDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/constants";
import type { Order } from "@/lib/types";
import { sendOrderStatusUpdateEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const db = await readDb();
  const order = db.orders.find((item) => item.id === params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { status?: string };
    if (!body.status || !ORDER_STATUSES.includes(body.status as Order["status"])) {
      return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
    }

    const updated = await mutateDb((db) => {
      const order = db.orders.find((item) => item.id === params.id);
      if (!order) return null;

      if (body.status === "cancelled" && order.status !== "cancelled") {
        for (const item of order.items) {
          const product = db.products.find((entry) => entry.id === item.productId);
          if (product) product.stock += item.qty;
        }
      }
      order.status = body.status as Order["status"];
      return order;
    });

    if (!updated) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    await sendOrderStatusUpdateEmail(updated);

    return NextResponse.json({ order: updated });
  } catch {
    return NextResponse.json({ error: "Could not update order." }, { status: 500 });
  }
}
