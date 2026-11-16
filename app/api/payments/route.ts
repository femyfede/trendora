import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { mutateDb } from "@/lib/db";
import type { ShopApplication, PaymentRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to submit a shop payment." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      applicationId: string;
      method: "M-Pesa" | "Mixx" | "Airtel" | "HaloPesa" | "other";
      reference: string;
    };

    const applicationId = String(body.applicationId ?? "").trim();
    const method = body.method;
    const reference = String(body.reference ?? "").trim();
    const methods = ["M-Pesa", "Mixx", "Airtel", "HaloPesa", "other"];

    if (!applicationId || !methods.includes(method) || reference.length < 4 || reference.length > 100) {
      return NextResponse.json(
        { error: "Enter a valid application, payment method and transaction reference." },
        { status: 400 }
      );
    }

    const mutatorResult = await mutateDb((db) => {
      const application = db.shopApplications.find((app) => app.id === applicationId);
      if (!application || application.ownerId !== user.id) {
        return { error: "Shop application not found.", status: 404 };
      }
      const amount = db.settings.shopRegistrationFeeTzs;
      if (
        !Number.isSafeInteger(amount) ||
        Number(amount) <= 0 ||
        !db.settings.shopPaymentInstructions.trim()
      ) {
        return {
          error: "Shop registration is unavailable until an administrator configures the fee.",
          status: 503
        };
      }
      if (application.status !== "PENDING_PAYMENT" && application.status !== "PAYMENT_PROCESSING") {
        return { error: "Application is not in pending payment status.", status: 409 };
      }
      if (
        db.payments.some(
          (payment) =>
            payment.reference?.toLowerCase() === reference.toLowerCase() &&
            payment.status !== "rejected" &&
            payment.status !== "failed"
        )
      ) {
        return { error: "This payment reference has already been submitted.", status: 409 };
      }

      const payment: PaymentRecord = {
        id: `pay-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        shopApplicationId: applicationId,
        amount: Number(amount),
        currency: "TZS",
        method,
        reference,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.payments.push(payment);
      application.status = "PAYMENT_PROCESSING";
      application.updatedAt = new Date().toISOString();
      return { application, payment };
    });

    if ("error" in mutatorResult && mutatorResult.error) {
      return NextResponse.json({ error: mutatorResult.error }, { status: mutatorResult.status });
    }

    const result = mutatorResult as { application: ShopApplication; payment: PaymentRecord };
    return NextResponse.json({
      application: result.application,
      payment: result.payment,
      message: "Payment submitted for administrator verification. The shop is not active."
    }, { status: 202 });
  } catch {
    return NextResponse.json({ error: "Could not submit payment for verification." }, { status: 500 });
  }
}