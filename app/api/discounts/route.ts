import { NextResponse } from "next/server";
import { mutateDb, readDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import type { Discount } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const db = await readDb();
  return NextResponse.json(db.discounts);
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<Discount>;
    const code = String(body.code ?? "").trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,20}$/.test(code)) {
      return NextResponse.json(
        { error: "Use 3–20 letters, numbers, dashes or underscores." },
        { status: 400 }
      );
    }
    const percent = Number(body.percent ?? 0);
    if (!Number.isFinite(percent) || percent < 0 || percent > 90) {
      return NextResponse.json({ error: "Percent must be between 0 and 90." }, { status: 400 });
    }
    if (percent === 0 && !body.freeShipping) {
      return NextResponse.json(
        { error: "A discount needs a percentage or free shipping." },
        { status: 400 }
      );
    }

    const result = await mutateDb((db) => {
      if (db.discounts.some((item) => item.code === code)) {
        return { error: "That code already exists.", status: 409 };
      }
      const discount: Discount = {
        code,
        percent: Math.round(percent),
        freeShipping: Boolean(body.freeShipping),
        active: body.active !== false,
        description:
          String(body.description ?? "").trim() ||
          (body.freeShipping
            ? "Free delivery"
            : `${Math.round(percent)}% off your order`)
      };
      db.discounts.unshift(discount);
      return { discount, status: 201 };
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ discount: result.discount }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create discount." }, { status: 500 });
  }
}
