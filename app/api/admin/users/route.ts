import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  try {
    const db = await readDb();
    const users = db.users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    }));
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Could not fetch users." }, { status: 500 });
  }
}
