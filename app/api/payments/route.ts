import { NextResponse } from "next/server";
import { mutateDb } from "@/lib/db";
import type { ShopApplication, Shop, PaymentRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      applicationId: string;
      shopId?: string;
      amount: number;
      method: "M-Pesa" | "Mixx" | "Airtel" | "HaloPesa" | "other";
      reference: string;
    };

    const { applicationId, shopId, amount, method, reference } = body;

    if (!applicationId || !amount || !method || !reference) {
      return NextResponse.json(
        { error: "Missing required payment fields." },
        { status: 400 }
      );
    }

    const mutatorResult = await mutateDb((db) => {
      // Find the application
      const applicationIndex = db.shopApplications.findIndex(
        (app) => app.id === applicationId
      );
      if (applicationIndex === -1) {
        return { error: "Shop application not found." };
      }

      const application = db.shopApplications[applicationIndex];

      // Check if already processed
      if (application.status !== "PENDING_PAYMENT" && application.status !== "PAYMENT_PROCESSING") {
        return { error: "Application is not in pending payment status." };
      }

      // Create or update payment record
      const paymentIndex = db.payments.findIndex(
        (pay) => pay.shopApplicationId === applicationId
      );

      const payment: PaymentRecord = {
        id: `pay-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        shopApplicationId: applicationId,
        shopId: shopId || undefined,
        amount,
        currency: "TZS",
        method,
        reference,
        status: "verified",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (paymentIndex === -1) {
        db.payments.push(payment);
      } else {
        db.payments[paymentIndex] = { ...db.payments[paymentIndex], ...payment };
      }

      // Update application status to PAYMENT_PROCESSING, then ACTIVE
      application.status = "PAYMENT_PROCESSING";
      application.updatedAt = new Date().toISOString();

      // Also update or create the shop
      const existingShop = db.shops.find((s) => s.ownerId === applicationId);
      if (!existingShop) {
        const newShop: Shop = {
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
          logo: "/placeholder-logo.png",
          coverImage: "/placeholder-cover.jpg",
          status: "ACTIVE",
          ownerId: application.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.shops.push(newShop);
        return { application, payment, shop: newShop };
      } else {
        existingShop.status = "ACTIVE";
        existingShop.updatedAt = new Date().toISOString();
        return { application, payment, shop: existingShop };
      }
    });

    if ("error" in mutatorResult && mutatorResult.error) {
      return NextResponse.json({ error: mutatorResult.error }, { status: 409 });
    }

    const result = mutatorResult as {
      application: ShopApplication;
      payment: PaymentRecord;
      shop: Shop;
    };
    return NextResponse.json({
      application: result.application,
      payment: result.payment,
      shop: result.shop,
      message: "Payment verified. Shop is now active.",
      success: true
    });
  } catch {
    return NextResponse.json({ error: "Could not process payment verification." }, { status: 500 });
  }
}