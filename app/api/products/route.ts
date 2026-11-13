import { NextResponse } from "next/server";
import { readDb, mutateDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { parseProductInput, uniqueSlug } from "@/lib/product-input";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const db = await readDb();
  const url = new URL(request.url);
  if (url.searchParams.get("all") === "1" && isAdmin()) {
    return NextResponse.json(db.products);
  }
  return NextResponse.json(
    db.products.filter((product) => product.isActive)
  );
}

export async function POST(request: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Parameters<typeof parseProductInput>[0];
    const parsed = parseProductInput(body);
    if (parsed.error || !parsed.product) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const product = await mutateDb((db) => {
      const candidate = {
        ...parsed.product!,
        slug: uniqueSlug(parsed.product!, db.products)
      };
      db.products.unshift(candidate);
      return candidate;
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create product." }, { status: 500 });
  }
}
