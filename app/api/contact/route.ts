import { NextResponse } from "next/server";
import { mutateDb } from "@/lib/db";
import { isValidEmail } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (name.length < 2) {
      return NextResponse.json({ error: "Enter your name." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }
    if (message.length < 10) {
      return NextResponse.json(
        { error: "Your message should be at least 10 characters." },
        { status: 400 }
      );
    }

    await mutateDb((db) => {
      db.messages.push({
        id: `msg-${Date.now().toString(36)}`,
        name,
        email,
        subject: subject || "General enquiry",
        message,
        createdAt: new Date().toISOString()
      });
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not send your message right now." },
      { status: 500 }
    );
  }
}
