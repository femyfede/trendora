import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string };
    const code = String(body.code ?? "").trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ error: "Enter a discount code." }, { status: 400 });
    }
    const db = await readDb();
    const discount = db.discounts.find(
      (item) => item.active && item.code.toUpperCase() === code
    );
    if (!discount) {
      return NextResponse.json(
        { error: "That code is invalid or has expired." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      code: discount.code,
      percent: discount.percent,
      freeShipping: discount.freeShipping,
      description: discount.description
    });
  } catch {
    return NextResponse.json({ error: "Could not validate code." }, { status: 500 });
  }
}
