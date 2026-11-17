import { NextResponse } from "next/server";
import { readDb, mutateDb } from "@/lib/db";
import {
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE,
  SESSION_TTL
} from "@/lib/auth";
import { getTranslator } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { tr } = await getTranslator();
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: tr("Enter your email and password.", "Weka barua pepe na nenosiri lako.") },
        { status: 400 }
      );
    }

    const db = await readDb();
    const user = db.users.find((u) => u.email === email && u.isActive);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: tr("Wrong email or password.", "Barua pepe au nenosiri si sahihi.") },
        { status: 401 }
      );
    }

    await mutateDb((db) => {
      const u = db.users.find((usr) => usr.id === user.id);
      if (u) {
        u.lastLoginAt = new Date().toISOString();
        u.updatedAt = new Date().toISOString();
      }
    });

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
    response.cookies.set(SESSION_COOKIE, createSessionToken(user.id, user.role), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_TTL / 1000,
      path: "/"
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: tr("Could not log in. Please try again.", "Imeshindwa kuingia. Tafadhali jaribu tena.") },
      { status: 500 }
    );
  }
}
