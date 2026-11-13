import { NextResponse } from "next/server";
import { mutateDb, readDb } from "@/lib/db";
import { isValidEmail } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const db = await readDb();
    if (db.subscribers.some((item) => item.email === email)) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }

    await mutateDb((database) => {
      if (!database.subscribers.some((item) => item.email === email)) {
        database.subscribers.push({
          email,
          createdAt: new Date().toISOString()
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not subscribe right now." },
      { status: 500 }
    );
  }
}
