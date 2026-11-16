import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = verifyAdminToken((await cookies()).get("trendora_admin")?.value) === true;
  return NextResponse.json({ admin });
}
