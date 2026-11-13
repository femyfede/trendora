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

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (name.length < 2) {
      return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    const result = await mutateDb((db) => {
      if (db.users.some((user) => user.email === email)) {
        return { error: "An account with that email already exists." };
      }
      const user = {
        id: `u-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        name,
        email,
        passwordHash,
        role: "customer" as const,
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.users.push(user);
      return { user };
    });

    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    const user = result.user!;
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

    await sendWelcomeEmail(user.email, user.name);

    return response;
  } catch {
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
