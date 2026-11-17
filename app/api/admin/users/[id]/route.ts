import { NextResponse } from "next/server";
import { mutateDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

export const dynamic = "force-dynamic";

const ROLES: UserRole[] = ["customer", "admin", "manager"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Only the password-protected admin session may manage users. A user-account
  // role alone is not enough, otherwise any account flagged "admin" could escalate.
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { isActive?: unknown; role?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be true or false." }, { status: 400 });
  }
  if (body.role !== undefined && !ROLES.includes(body.role as UserRole)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  try {
    const { id } = await params;
    const user = await mutateDb((db) => {
      const target = db.users.find((entry) => entry.id === id);
      if (!target) return null;
      if (typeof body.isActive === "boolean") target.isActive = body.isActive;
      if (body.role) target.role = body.role as UserRole;
      target.updatedAt = new Date().toISOString();
      const { passwordHash: _passwordHash, ...safe } = target;
      return safe;
    });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Could not update user." }, { status: 500 });
  }
}
