import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkAdminPassword, createAdminToken } from "@/lib/auth";

const ADMIN_COOKIE = "trendora_admin";
const SESSION_TTL = 1000 * 60 * 60 * 24 * 7;

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const password = String(body.password ?? "");

    if (!password) {
      return NextResponse.json(
        { error: "Enter the admin password." },
        { status: 400 }
      );
    }

    if (!checkAdminPassword(password)) {
      return NextResponse.json(
        { error: "Invalid admin password." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ admin: true });
    response.cookies.set(ADMIN_COOKIE, createAdminToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_TTL / 1000,
      path: "/"
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Could not sign in." },
      { status: 500 }
    );
  }
}
