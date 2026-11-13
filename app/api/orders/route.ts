import { NextResponse } from "next/server";
import { mutateDb, readDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import {
  FREE_SHIPPING_THRESHOLD,
  PAYMENT_METHODS,
  REGIONS
} from "@/lib/constants";
import {
  isValidEmail,
  isValidTzPhone,
  orderId
} from "@/lib/utils";
import type { Order, OrderItem } from "@/lib/types";
import { sendOrderConfirmationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

type IncomingItem = {
  productId?: string;
  size?: string;
  color?: string;
  qty?: number;
};

type CheckoutBody = {
  items?: IncomingItem[];
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    country?: string;
    region?: string;
    city?: string;
    address?: string;
    notes?: string;
  };
  paymentMethod?: string;
  discountCode?: string;
};

export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const db = await readDb();
  const orders = [...db.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const customer = body.customer ?? {};
  const required: (keyof NonNullable<CheckoutBody["customer"]>)[] = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "country",
    "region",
    "city",
    "address"
  ];
  const missing = required.filter((key) => !String(customer[key] ?? "").trim());
  if (missing.length) {
    return NextResponse.json(
      { error: `Please complete the required delivery details.` },
      { status: 400 }
    );
  }
  if (!isValidEmail(String(customer.email))) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!isValidTzPhone(String(customer.phone))) {
    return NextResponse.json(
      { error: "Please enter a valid phone number." },
      { status: 400 }
    );
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const method = PAYMENT_METHODS.find((item) => item.id === body.paymentMethod);
  if (!method || !method.available) {
    return NextResponse.json(
      { error: "That payment method is not available yet." },
      { status: 400 }
    );
  }

  const result = await mutateDb((db) => {
    const items: OrderItem[] = [];

    for (const item of body.items ?? []) {
      const product = db.products.find((entry) => entry.id === item.productId);
      if (!product || !product.isActive)
        return { status: 404, error: "A product in your cart is no longer available." };

      const size = String(item.size ?? "");
      const color = String(item.color ?? "");
      if (!product.sizes.includes(size))
        return { status: 400, error: `Please choose a valid size for ${product.name}.` };
      if (!product.colors.some((entry) => entry.name === color))
        return { status: 400, error: `Please choose a valid colour for ${product.name}.` };

      const qty = Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 1)));
      if (qty > product.stock)
        return {
          status: 409,
          error: `Only ${product.stock} of ${product.name} available in that size.`
        };

      items.push({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0],
        price: product.price,
        size,
        color,
        qty
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    let discount = null;
    if (body.discountCode) {
      discount = db.discounts.find(
        (entry) =>
          entry.active &&
          entry.code.toUpperCase() === String(body.discountCode).trim().toUpperCase()
      );
      if (!discount)
        return { status: 400, error: "That discount code is no longer valid." };
    }

    const discountAmount = discount
      ? Math.round((subtotal * discount.percent) / 100)
      : 0;

    let baseShipping = 35000;
    if (customer.country === "Tanzania") {
      const region = REGIONS.find((entry) => entry.name === customer.region);
      if (!region)
        return { status: 400, error: "Choose a delivery region in Tanzania." };
      baseShipping = region.fee;
    }

    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const freeShipping =
      afterDiscount >= FREE_SHIPPING_THRESHOLD || Boolean(discount?.freeShipping);
    const shippingFee = freeShipping ? 0 : baseShipping;
    const total = afterDiscount + shippingFee;

    for (const item of items) {
      const product = db.products.find((entry) => entry.id === item.productId);
      if (product) product.stock = Math.max(0, product.stock - item.qty);
    }

    const order: Order = {
      id: orderId(),
      items,
      subtotal,
      discountAmount,
      shippingFee,
      total,
      discountCode: discount?.code ?? null,
      customer: {
        firstName: String(customer.firstName).trim(),
        lastName: String(customer.lastName).trim(),
        email: String(customer.email).trim().toLowerCase(),
        phone: String(customer.phone).trim(),
        country: String(customer.country).trim(),
        region: String(customer.region).trim(),
        city: String(customer.city).trim(),
        address: String(customer.address).trim(),
        notes: customer.notes ? String(customer.notes).trim() : ""
      },
      paymentMethod: method.id,
      paymentStatus: method.id === "test" ? "test_paid" : "unpaid",
      status: "pending",
      createdAt: new Date().toISOString()
    };

    db.orders.unshift(order);
    return { status: 201, order };
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const order = result.order!;
  await sendOrderConfirmationEmail(order);

  return NextResponse.json({ order }, { status: 201 });
}
