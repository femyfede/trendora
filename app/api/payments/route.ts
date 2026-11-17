import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { mutateDb } from "@/lib/db";
import type { ShopApplication, PaymentRecord } from "@/lib/types";
import { getTranslator } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { tr } = await getTranslator();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: tr("Log in first.", "Ingia kwanza.") }, { status: 401 });
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
        {
          error: tr(
            "Choose the payment method and enter the transaction ID from your SMS.",
            "Chagua njia ya malipo na uweke namba ya muamala kutoka kwenye SMS yako."
          )
        },
        { status: 400 }
      );
    }

    const mutatorResult = await mutateDb((db) => {
      const application = db.shopApplications.find((app) => app.id === applicationId);
      if (!application || application.ownerId !== user.id) {
        return { error: tr("Shop application not found.", "Ombi la duka halikupatikana."), status: 404 };
      }
      const amount = db.settings.shopRegistrationFeeTzs;
      if (
        !Number.isSafeInteger(amount) ||
        Number(amount) <= 0 ||
        !db.settings.shopPaymentInstructions.trim()
      ) {
        return {
          error: tr("Shop registration is not open yet.", "Usajili wa maduka bado haujafunguliwa."),
          status: 503
        };
      }
      if (db.payments.some((payment) => payment.shopApplicationId === applicationId && payment.status === "pending")) {
        return {
          error: tr(
            "Your payment details are already being checked. Please wait.",
            "Taarifa zako za malipo tayari zinahakikiwa. Tafadhali subiri."
          ),
          status: 409
        };
      }
      if (application.status !== "PENDING_PAYMENT" && application.status !== "PAYMENT_PROCESSING") {
        return { error: tr("This application is not waiting for payment.", "Ombi hili halisubiri malipo."), status: 409 };
      }
      if (
        db.payments.some(
          (payment) =>
            payment.reference?.toLowerCase() === reference.toLowerCase() &&
            payment.status !== "rejected" &&
            payment.status !== "failed"
        )
      ) {
        return { error: tr("This transaction ID has already been submitted.", "Namba hii ya muamala tayari imeshatumwa."), status: 409 };
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
      message: tr("Payment details received. We will verify them.", "Taarifa za malipo zimepokelewa. Tutazihakiki.")
    }, { status: 202 });
  } catch {
    return NextResponse.json({ error: tr("Could not send payment details. Please try again.", "Imeshindwa kutuma taarifa za malipo. Tafadhali jaribu tena.") }, { status: 500 });
  }
}