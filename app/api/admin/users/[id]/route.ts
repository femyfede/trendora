import { NextResponse } from "next/server";
import { readDb, mutateDb } from "@/lib/db";
import { hasRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await hasRole("admin");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = (await request.json()) as { isActive?: boolean; role?: string };

    const result = await mutateDb((db) => {
      const userIndex = db.users.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        return { error: "User not found" };
      }

      if (body.isActive !== undefined) {
        db.users[userIndex].isActive = body.isActive;
      }
      if (body.role && ["customer", "admin", "manager"].includes(body.role)) {
        db.users[userIndex].role = body.role as "customer" | "admin" | "manager";
      }
      db.users[userIndex].updatedAt = new Date().toISOString();

      const { passwordHash, ...user } = db.users[userIndex];
      return { user };
    });

    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json({ error: "Could not update user" }, { status: 500 });
  }
}