import { NextResponse } from "next/server";
import { readDb, mutateDb } from "@/lib/db";
import {
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE,
  SESSION_TTL
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
    }

    const db = await readDb();
    const user = db.users.find((u) => u.email === email && u.isActive);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
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
    return NextResponse.json({ error: "Could not sign in." }, { status: 500 });
  }
}