import { NextResponse } from "next/server";
import { mutateDb } from "@/lib/db";
import { isValidEmail } from "@/lib/utils";
import { getTranslator } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { tr } = await getTranslator();
  try {
    const body = (await request.json()) as { email?: string };
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!isValidEmail(email) || email.length > 200) {
      return NextResponse.json({ error: tr("Enter a valid email address.", "Weka barua pepe sahihi.") }, { status: 400 });
    }

    const alreadySubscribed = await mutateDb((database) => {
      if (database.subscribers.some((item) => item.email === email)) return true;
      database.subscribers.push({ email, createdAt: new Date().toISOString() });
      return false;
    });

    return NextResponse.json({ ok: true, alreadySubscribed });
  } catch {
    return NextResponse.json(
      { error: tr("Could not subscribe right now. Please try again.", "Imeshindwa kujiunga sasa hivi. Tafadhali jaribu tena.") },
      { status: 500 }
    );
  }
}
