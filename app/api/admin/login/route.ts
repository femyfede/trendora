import { NextResponse } from "next/server";
import {
  checkAdminPassword,
  createAdminToken,
  ADMIN_COOKIE,
  SESSION_TTL
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    if (!checkAdminPassword(String(body.password ?? ""))) {
      return NextResponse.json({ error: "Incorrect admin password." }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, createAdminToken(), {
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
