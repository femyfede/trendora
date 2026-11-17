import { NextResponse } from "next/server";
import { mutateDb } from "@/lib/db";
import {
  createSessionToken,
  hashPassword,
  SESSION_COOKIE,
  SESSION_TTL
} from "@/lib/auth";
import { isValidEmail } from "@/lib/utils";
import { sendWelcomeEmail } from "@/lib/email";
import { getTranslator } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { tr } = await getTranslator();
  try {
    const body = (await request.json()) as { name?: string; email?: string; password?: string };

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json({ error: tr("Enter your full name.", "Weka jina lako kamili.") }, { status: 400 });
    }
    if (!isValidEmail(email) || email.length > 200) {
      return NextResponse.json({ error: tr("Enter a valid email address.", "Weka barua pepe sahihi.") }, { status: 400 });
    }
    if (password.length < 8 || password.length > 200) {
      return NextResponse.json(
        { error: tr("Password must be at least 8 characters.", "Nenosiri liwe na herufi 8 au zaidi.") },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    const result = await mutateDb((db) => {
      if (db.users.some((user) => user.email === email)) {
        return { error: true as const };
      }
      const now = new Date().toISOString();
      const user = {
        id: `u-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        name,
        email,
        passwordHash,
        role: "customer" as const,
        isActive: true,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now
      };
      db.users.push(user);
      return { user };
    });

    if ("error" in result) {
      return NextResponse.json(
        {
          error: tr(
            "An account with this email already exists. Log in instead.",
            "Akaunti yenye barua pepe hii tayari ipo. Tafadhali ingia."
          )
        },
        { status: 409 }
      );
    }

    const user = result.user;
    const response = NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { status: 201 }
    );
    response.cookies.set(SESSION_COOKIE, createSessionToken(user.id, user.role), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_TTL / 1000,
      path: "/"
    });

    // A failed welcome email must not fail the registration.
    await sendWelcomeEmail(user.email, user.name).catch(() => undefined);

    return response;
  } catch {
    return NextResponse.json(
      { error: tr("Could not create your account. Please try again.", "Imeshindwa kufungua akaunti. Tafadhali jaribu tena.") },
      { status: 500 }
    );
  }
}
