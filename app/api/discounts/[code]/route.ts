import { NextResponse } from "next/server";
import { mutateDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import type { Discount } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { code: routeCode } = await params;
    const body = (await request.json()) as Partial<Discount>;
    const code = routeCode.toUpperCase();

    const updated = await mutateDb((db) => {
      const discount = db.discounts.find((item) => item.code === code);
      if (!discount) return null;
      if (typeof body.active === "boolean") discount.active = body.active;
      if (typeof body.percent === "number")
        discount.percent = Math.max(0, Math.min(90, Math.round(body.percent)));
      if (typeof body.freeShipping === "boolean")
        discount.freeShipping = body.freeShipping;
      if (typeof body.description === "string")
        discount.description = body.description.trim() || discount.description;
      return discount;
    });

    if (!updated) {
      return NextResponse.json({ error: "Discount not found." }, { status: 404 });
    }
    return NextResponse.json({ discount: updated });
  } catch {
    return NextResponse.json({ error: "Could not update discount." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { code: routeCode } = await params;
  const deleted = await mutateDb((db) => {
    const code = routeCode.toUpperCase();
    const exists = db.discounts.some((item) => item.code === code);
    if (!exists) return false;
    db.discounts = db.discounts.filter((item) => item.code !== code);
    return true;
  });

  if (!deleted) {
    return NextResponse.json({ error: "Discount not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
