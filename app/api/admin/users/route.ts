import { NextResponse } from "next/server";
import { readDb, mutateDb } from "@/lib/db";
import { hasRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await hasRole("admin", "manager");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const db = await readDb();
    const users = db.users.map(({ passwordHash, ...user }) => user);
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Could not fetch users" }, { status: 500 });
  }
}