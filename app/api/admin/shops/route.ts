import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { mutateDb, readDb } from "@/lib/db";
import type { Shop, ShopApplication } from "@/lib/types";

export const dynamic = "force-dynamic";

function createShop(application: ShopApplication, status: Shop["status"]): Shop {
  const now = new Date().toISOString();
  return {
    id: `s-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    name: application.shopName,
    ownerName: application.ownerName,
    phone: application.phone,
    whatsapp: application.whatsapp,
    email: application.email,
    category: application.category,
    description: application.description,
    region: application.region,
    district: application.district,
    physicalLocation: application.physicalLocation,
    status,
    ownerId: application.ownerId,
    createdAt: now,
    updatedAt: now
  };
}

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const db = await readDb();

  if (action === "list-pending") {
    return NextResponse.json({
      applications: db.shopApplications.filter((application) =>
        ["PENDING_PAYMENT", "PAYMENT_PROCESSING", "PENDING_APPROVAL"].includes(application.status)
      )
    });
  }
  if (action === "list-all") {
    return NextResponse.json({
      applications: [...db.shopApplications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });
  }
  if (action === "shops-list") {
    return NextResponse.json({
      shops: [...db.shops].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });
  }
  if (action === "payments-list") {
    return NextResponse.json({
      payments: [...db.payments].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });
  }
  if (action === "settings") {
    return NextResponse.json({ settings: db.settings });
  }
  if (action === "shop-detail") {
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Shop ID required." }, { status: 400 });
    }
    const shop = db.shops.find((entry) => entry.id === id);
    if (!shop) {
      return NextResponse.json({ error: "Shop not found." }, { status: 404 });
    }
    return NextResponse.json({ shop });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: {
    action?: string;
    id?: string;
    paymentId?: string;
    fee?: number | null;
    instructions?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const action = String(body.action ?? "");
  if (!["save-settings", "verify-payment", "approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Valid action is required." }, { status: 400 });
  }
  if (action === "save-settings") {
    if (
      body.fee !== null &&
      (!Number.isSafeInteger(body.fee) || Number(body.fee) <= 0)
    ) {
      return NextResponse.json(
        { error: "The shop registration fee must be a positive whole TZS amount, or null to unset it." },
        { status: 400 }
      );
    }
    const instructions = String(body.instructions ?? "").trim();
    if (instructions.length > 2000) {
      return NextResponse.json({ error: "Payment instructions must be 2,000 characters or fewer." }, { status: 400 });
    }
    const settings = await mutateDb((db) => {
      db.settings.shopRegistrationFeeTzs = body.fee ?? null;
      db.settings.shopPaymentInstructions = instructions;
      return db.settings;
    });
    return NextResponse.json({ settings });
  }

  const id = String(body.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "Valid action and application ID are required." }, { status: 400 });
  }

  const result = await mutateDb((db) => {
    const application = db.shopApplications.find((entry) => entry.id === id);
    if (!application) return { error: "Application not found.", status: 404 };

    if (action === "verify-payment") {
      if (!["PENDING_PAYMENT", "PAYMENT_PROCESSING"].includes(application.status)) {
        return { error: "Application is not awaiting payment verification.", status: 409 };
      }
      const payment = db.payments.find(
        (entry) =>
          entry.id === body.paymentId &&
          entry.shopApplicationId === application.id &&
          entry.status === "pending"
      );
      if (!payment) {
        return { error: "A pending payment for this application was not found.", status: 404 };
      }

      const now = new Date().toISOString();
      payment.status = "verified";
      payment.updatedAt = now;
      application.status = "PENDING_APPROVAL";
      application.updatedAt = now;

      let shop = db.shops.find(
        (entry) => entry.ownerId === application.ownerId || entry.phone === application.phone
      );
      if (!shop) {
        shop = createShop(application, "PENDING_APPROVAL");
        db.shops.push(shop);
      } else {
        if (shop.status !== "ACTIVE") shop.status = "PENDING_APPROVAL";
        shop.updatedAt = now;
      }
      return { application, payment, shop };
    }

    if (action === "approve") {
      const hasVerifiedPayment = db.payments.some(
        (payment) =>
          payment.shopApplicationId === application.id && payment.status === "verified"
      );
      if (!hasVerifiedPayment || application.status !== "PENDING_APPROVAL") {
        return {
          error: "Verify a payment before approving this shop.",
          status: 409
        };
      }

      const now = new Date().toISOString();
      application.status = "ACTIVE";
      application.updatedAt = now;
      let shop = db.shops.find(
        (entry) => entry.ownerId === application.ownerId || entry.phone === application.phone
      );
      if (!shop) {
        shop = createShop(application, "ACTIVE");
        db.shops.push(shop);
      } else {
        shop.status = "ACTIVE";
        shop.updatedAt = now;
      }
      return { application, shop };
    }

    if (!["PENDING_PAYMENT", "PAYMENT_PROCESSING", "PENDING_APPROVAL"].includes(application.status)) {
      return { error: "Only pending applications can be rejected.", status: 409 };
    }
    const now = new Date().toISOString();
    application.status = "REJECTED";
    application.updatedAt = now;
    const shop = db.shops.find(
      (entry) => entry.ownerId === application.ownerId || entry.phone === application.phone
    );
    if (shop) {
      shop.status = "REJECTED";
      shop.updatedAt = now;
    }
    return { application };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result);
}
