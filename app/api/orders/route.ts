import { NextResponse } from "next/server";
import { mutateDb, readDb } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import {
  FREE_SHIPPING_THRESHOLD,
  INTERNATIONAL_SHIPPING_FEE,
  PAYMENT_METHODS,
  SELECTABLE_REGIONS
} from "@/lib/constants";
import { getTranslator } from "@/lib/i18n-server";
import {
  isValidEmail,
  isValidTzPhone,
  orderId
} from "@/lib/utils";
import type { Order, OrderItem } from "@/lib/types";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { createOrderAccessToken, hashOrderAccessToken } from "@/lib/order-access";

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
  const admin = await isAdmin();
  const user = admin ? null : await getCurrentUser();
  if (!admin && !user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const db = await readDb();
  const visibleOrders = admin
    ? db.orders
    : db.orders.filter((order) => order.userId === user?.id);
  const orders = [...visibleOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).map(({ accessTokenHash, ...order }) => order);
  return NextResponse.json(orders);
}

const LIMITS: Record<string, number> = {
  firstName: 60,
  lastName: 60,
  email: 200,
  phone: 30,
  country: 60,
  region: 80,
  city: 100,
  address: 300,
  notes: 500
};

export async function POST(request: Request) {
  const { tr } = await getTranslator();
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: tr("Invalid request.", "Ombi si sahihi.") }, { status: 400 });
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
      { error: tr("Please fill in all the delivery details.", "Tafadhali jaza taarifa zote za usafirishaji.") },
      { status: 400 }
    );
  }
  if (Object.entries(LIMITS).some(([key, max]) => String(customer[key as keyof typeof customer] ?? "").length > max)) {
    return NextResponse.json(
      { error: tr("Some delivery details are too long.", "Baadhi ya taarifa ni ndefu kupita kiasi.") },
      { status: 400 }
    );
  }
  if (!isValidEmail(String(customer.email))) {
    return NextResponse.json({ error: tr("Enter a valid email address.", "Weka barua pepe sahihi.") }, { status: 400 });
  }
  if (!isValidTzPhone(String(customer.phone))) {
    return NextResponse.json(
      { error: tr("Enter a valid phone number, e.g. 0712 345 678.", "Weka namba ya simu sahihi, mfano 0712 345 678.") },
      { status: 400 }
    );
  }
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
    return NextResponse.json({ error: tr("Your cart is empty.", "Kikapu chako hakina kitu.") }, { status: 400 });
  }

  const method = PAYMENT_METHODS.find((item) => item.id === body.paymentMethod);
  if (!method || !method.available) {
    return NextResponse.json(
      { error: tr("That payment method is not available yet.", "Njia hiyo ya malipo bado haipatikani.") },
      { status: 400 }
    );
  }

  const user = await getCurrentUser();
  const accessToken = createOrderAccessToken();
  const result = await mutateDb((db) => {
    const items: OrderItem[] = [];

    for (const item of body.items ?? []) {
      const product = db.products.find((entry) => entry.id === item.productId);
      if (!product || !product.isActive)
        return {
          status: 404,
          error: tr(
            "A product in your cart is no longer available. Please remove it and try again.",
            "Bidhaa moja kwenye kikapu chako haipatikani tena. Iondoe kisha ujaribu tena."
          )
        };

      const size = String(item.size ?? "");
      const color = String(item.color ?? "");
      if (!product.sizes.includes(size))
        return { status: 400, error: tr(`Choose a valid size for ${product.name}.`, `Chagua ukubwa sahihi wa ${product.name}.`) };
      if (!product.colors.some((entry) => entry.name === color))
        return { status: 400, error: tr(`Choose a valid colour for ${product.name}.`, `Chagua rangi sahihi ya ${product.name}.`) };

      const qty = Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 1)));
      const alreadyInOrder = items
        .filter((entry) => entry.productId === product.id)
        .reduce((total, entry) => total + entry.qty, 0);
      if (qty + alreadyInOrder > product.stock)
        return {
          status: 409,
          error: tr(
            `Only ${product.stock} of ${product.name} left. Please reduce the quantity.`,
            `Zimebaki ${product.stock} tu za ${product.name}. Tafadhali punguza idadi.`
          )
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
        return { status: 400, error: tr("That discount code is no longer valid.", "Kuponi hiyo haifanyi kazi tena.") };
    }

    const discountAmount = discount
      ? Math.round((subtotal * discount.percent) / 100)
      : 0;

    let baseShipping = INTERNATIONAL_SHIPPING_FEE;
    if (customer.country === "Tanzania") {
      const region = SELECTABLE_REGIONS.find((entry) => entry.name === customer.region);
      if (!region)
        return { status: 400, error: tr("Choose your delivery region.", "Chagua mkoa wa kupelekewa mzigo.") };
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
      userId: user?.id,
      accessTokenHash: hashOrderAccessToken(accessToken),
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
  // The order is saved; an email failure must not report the checkout as failed.
  await sendOrderConfirmationEmail(order).catch(() => undefined);

  const { accessTokenHash, ...publicOrder } = order;
  return NextResponse.json({ order: publicOrder, accessToken }, { status: 201 });
}
