import { NextResponse } from "next/server";
import { mutateDb } from "@/lib/db";
import { isValidEmail } from "@/lib/utils";
import { getTranslator } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { tr } = await getTranslator();
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

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: tr("Enter your name.", "Weka jina lako.") }, { status: 400 });
    }
    if (!isValidEmail(email) || email.length > 200) {
      return NextResponse.json({ error: tr("Enter a valid email address.", "Weka barua pepe sahihi.") }, { status: 400 });
    }
    if (subject.length > 150) {
      return NextResponse.json({ error: tr("The subject is too long.", "Kichwa cha ujumbe ni kirefu mno.") }, { status: 400 });
    }
    if (message.length < 10 || message.length > 3000) {
      return NextResponse.json(
        {
          error: tr(
            "Your message should be between 10 and 3,000 characters.",
            "Ujumbe wako uwe na herufi kati ya 10 na 3,000."
          )
        },
        { status: 400 }
      );
    }

    await mutateDb((db) => {
      db.messages.push({
        id: `msg-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
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
      { error: tr("Could not send your message right now. Please try again.", "Imeshindwa kutuma ujumbe sasa hivi. Tafadhali jaribu tena.") },
      { status: 500 }
    );
  }
}
