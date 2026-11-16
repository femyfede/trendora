import { NextResponse } from "next/server";
import { mutateDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      shopName: string;
      ownerName: string;
      phone: string;
      whatsapp?: string;
      email?: string;
      category: string;
      description: string;
      region: string;
      district: string;
      physicalLocation: string;
    };

    const {
      shopName,
      ownerName,
      phone,
      whatsapp,
      email,
      category,
      description,
      region,
      district,
      physicalLocation
    } = body;

    // Validation
    if (shopName.length < 3) {
      return NextResponse.json(
        { error: "Shop name must be at least 3 characters." },
        { status: 400 }
      );
    }
    if (ownerName.length < 3) {
      return NextResponse.json(
        { error: "Owner name must be at least 3 characters." },
        { status: 400 }
      );
    }
    if (!phone.trim()) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      );
    }
    if (category.length < 2) {
      return NextResponse.json(
        { error: "Category is required." },
        { status: 400 }
      );
    }
    if (!description.trim()) {
      return NextResponse.json(
        { error: "Shop description is required." },
        { status: 400 }
      );
    }
    if (!region.trim()) {
      return NextResponse.json(
        { error: "Region is required." },
        { status: 400 }
      );
    }
    if (!district.trim()) {
      return NextResponse.json(
        { error: "District is required." },
        { status: 400 }
      );
    }
    if (!physicalLocation.trim()) {
      return NextResponse.json(
        { error: "Physical location is required." },
        { status: 400 }
      );
    }

    const result = await mutateDb((db) => {
      // Check for duplicate application
      if (db.shopApplications.some((app) => app.phone === phone)) {
        return { error: "A shop application with this phone number already exists." };
      }
      if (db.shops.some((shop) => shop.phone === phone)) {
        return { error: "A shop with this phone number already exists." };
      }

      const application: ShopApplication = {
        id: `app-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        shopName,
        ownerName,
        phone,
        whatsapp,
        email,
        category,
        description,
        region,
        district,
        physicalLocation,
        status: "PENDING_PAYMENT",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.shopApplications.push(application);
      return { application };
    });

    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    const application = result.application!;
    return NextResponse.json(
      { 
        application,
        message: "Shop application submitted successfully. Please complete payment to activate your shop.",
        pendingPayment: true
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Could not submit shop application." }, { status: 500 });
  }
}