import { NextResponse } from "next/server";
import { isAdmin, getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const admin = isAdmin();
  return NextResponse.json({ admin, user });
}
