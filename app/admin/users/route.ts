import { NextResponse } from "next/server";
import { mutateDb, readDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
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
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { id?: string; isActive?: boolean };
    const { id, isActive } = body;
    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "User id and isActive are required." },
        { status: 400 }
      );
    }

    const updated = await mutateDb((db) => {
      const user = db.users.find((u) => u.id === id);
      if (!user) return null;
      user.isActive = isActive;
      user.updatedAt = new Date().toISOString();
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    });

    if (!updated) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json(
      { error: "Could not update user." },
      { status: 500 }
    );
  }
}
