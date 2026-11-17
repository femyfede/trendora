import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { getTranslator } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { tr } = await getTranslator();
  try {
    const body = (await request.json()) as { code?: string };
    const code = String(body.code ?? "").trim().toUpperCase().slice(0, 40);
    if (!code) {
      return NextResponse.json({ error: tr("Enter a discount code.", "Weka kuponi ya punguzo.") }, { status: 400 });
    }
    const db = await readDb();
    const discount = db.discounts.find((item) => item.active && item.code.toUpperCase() === code);
    if (!discount) {
      return NextResponse.json(
        { error: tr("That code is not valid or has expired.", "Kuponi hiyo si sahihi au muda wake umeisha.") },
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
    return NextResponse.json(
      { error: tr("Could not check the code. Please try again.", "Imeshindwa kuhakiki kuponi. Tafadhali jaribu tena.") },
      { status: 500 }
    );
  }
}
