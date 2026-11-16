import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { CATEGORIES, REGIONS } from "@/lib/constants";
import { mutateDb, readDb } from "@/lib/db";
import { isValidEmail } from "@/lib/utils";
import type { ShopApplication } from "@/lib/types";

export const dynamic = "force-dynamic";

type ApplicationBody = {
  shopName?: string;
  ownerName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  category?: string;
  description?: string;
  region?: string;
  district?: string;
  physicalLocation?: string;
};

const cleanPhone = (value: string) => value.replace(/[\s()-]/g, "");
const isTanzaniaMobile = (value: string) => /^(\+255|0)[67]\d{8}$/.test(value);

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to view your shop applications." }, { status: 401 });
  }
  const db = await readDb();
  const applications = db.shopApplications
    .filter((application) => application.ownerId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const applicationIds = new Set(applications.map((application) => application.id));
  const payments = db.payments.filter((payment) => applicationIds.has(payment.shopApplicationId));
  return NextResponse.json({
    applications,
    payments,
    shopSettings: {
      shopRegistrationFeeTzs: db.settings.shopRegistrationFeeTzs,
      shopPaymentInstructions: db.settings.shopPaymentInstructions
    }
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in before opening a shop." }, { status: 401 });
  }

  let body: ApplicationBody;
  try {
    body = (await request.json()) as ApplicationBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const shopName = String(body.shopName ?? "").trim();
  const ownerName = String(body.ownerName ?? "").trim();
  const phone = cleanPhone(String(body.phone ?? "").trim());
  const whatsapp = cleanPhone(String(body.whatsapp ?? "").trim());
  const email = String(body.email ?? "").trim().toLowerCase();
  const category = String(body.category ?? "").trim();
  const description = String(body.description ?? "").trim();
  const region = String(body.region ?? "").trim();
  const district = String(body.district ?? "").trim();
  const physicalLocation = String(body.physicalLocation ?? "").trim();

  if (shopName.length < 3 || shopName.length > 100) {
    return NextResponse.json({ error: "Shop name must be 3 to 100 characters." }, { status: 400 });
  }
  if (ownerName.length < 3 || ownerName.length > 100) {
    return NextResponse.json({ error: "Enter the owner's full name." }, { status: 400 });
  }
  if (!isTanzaniaMobile(phone) || (whatsapp && !isTanzaniaMobile(whatsapp))) {
    return NextResponse.json({ error: "Enter a valid Tanzania phone number (+255)." }, { status: 400 });
  }
  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!CATEGORIES.some((entry) => entry.value === category)) {
    return NextResponse.json({ error: "Choose a valid business category." }, { status: 400 });
  }
  if (description.length < 20 || description.length > 2000) {
    return NextResponse.json({ error: "Description must be 20 to 2,000 characters." }, { status: 400 });
  }
  if (!REGIONS.some((entry) => entry.name === region)) {
    return NextResponse.json({ error: "Choose a valid Tanzania region." }, { status: 400 });
  }
  if (!district || district.length > 100 || !physicalLocation || physicalLocation.length > 300) {
    return NextResponse.json({ error: "Enter a valid district and physical shop location." }, { status: 400 });
  }

  const result = await mutateDb((db) => {
    const fee = db.settings.shopRegistrationFeeTzs;
    if (
      !Number.isSafeInteger(fee) ||
      Number(fee) <= 0 ||
      !db.settings.shopPaymentInstructions.trim()
    ) {
      return { error: "Shop registration is unavailable until an administrator configures the fee.", status: 503 };
    }
    if (
      db.shopApplications.some(
        (application) =>
          application.ownerId === user.id &&
          application.status !== "REJECTED" &&
          application.status !== "EXPIRED"
      )
    ) {
      return { error: "You already have an active or pending shop application.", status: 409 };
    }
    if (
      db.shopApplications.some((application) => cleanPhone(application.phone) === phone) ||
      db.shops.some((shop) => cleanPhone(shop.phone) === phone)
    ) {
      return { error: "A shop application or shop already uses this phone number.", status: 409 };
    }

    const now = new Date().toISOString();
    const application: ShopApplication = {
      id: `app-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
      ownerId: user.id,
      shopName,
      ownerName,
      phone,
      whatsapp: whatsapp || undefined,
      email: email || undefined,
      category,
      description,
      region,
      district,
      physicalLocation,
      status: "PENDING_PAYMENT",
      createdAt: now,
      updatedAt: now
    };

    db.shopApplications.push(application);
    return { application, fee };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({
    application: result.application,
    requiredPaymentTzs: result.fee,
    message: "Application submitted. The shop will stay private until payment is verified and approved."
  }, { status: 201 });
}
