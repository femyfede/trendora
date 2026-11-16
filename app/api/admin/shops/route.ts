import { NextResponse } from "next/server";
import { mutateDb } from "@/lib/db";
import type { Shop } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const status = searchParams.get("status");

    if (action === "list-pending") {
      const db = await mutateDb((db) => {
        const pending = db.shopApplications.filter(
          (app) => app.status === "PENDING_PAYMENT" || app.status === "PENDING_APPROVAL"
        );
        return { applications: pending };
      });
      return NextResponse.json(db);
    }

    if (action === "list-all") {
      const db = await mutateDb((db) => {
        const all = db.shopApplications.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return { applications: all };
      });
      return NextResponse.json(db);
    }

    if (action === "shops-list") {
      const db = await mutateDb((db) => {
        const shops = db.shops.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return { shops };
      });
      return NextResponse.json(db);
    }

    if (action === "shop-detail") {
      const id = searchParams.get("id");
      if (!id) {
        return NextResponse.json({ error: "Shop ID required." }, { status: 400 });
      }
      const db = await mutateDb((db) => {
        const shop = db.shops.find((s) => s.id === id);
        return { shop };
      });
      if (!db.shop) {
        return NextResponse.json({ error: "Shop not found." }, { status: 404 });
      }
      return NextResponse.json(db);
    }

    if (action === "approve") {
      const id = searchParams.get("id");
      if (!id) {
        return NextResponse.json({ error: "Application ID required." }, { status: 400 });
      }
      const db = await mutateDb((db) => {
        const application = db.shopApplications.find((app) => app.id === id);
        if (!application) {
          return { error: "Application not found." };
        }

        // Create shop from approved application
        const shop: Shop = {
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

        application.status = "ACTIVE";
        db.shops.push(shop);
        return { application, shop };
      });
      return NextResponse.json(db);
    }

    if (action === "reject") {
      const id = searchParams.get("id");
      const reason = searchParams.get("reason") || "Application rejected by administrator.";
      if (!id) {
        return NextResponse.json({ error: "Application ID required." }, { status: 400 });
      }
      const db = await mutateDb((db) => {
        const application = db.shopApplications.find((app) => app.id === id);
        if (!application) {
          return { error: "Application not found." };
        }
        application.status = "REJECTED";
        application.updatedAt = new Date().toISOString();
        return { application };
      });
      return NextResponse.json(db);
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Could not process admin request." }, { status: 500 });
  }
}