import { NextResponse } from "next/server";
import { readDb, mutateDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { parseProductInput, uniqueSlug } from "@/lib/product-input";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await readDb();
  const product = db.products.find(
    (item) => item.id === id || item.slug === id
  );
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  if (!product.isActive && !(await isAdmin())) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as Parameters<typeof parseProductInput>[0];
    const result = await mutateDb((db) => {
      const existing = db.products.find((item) => item.id === id);
      if (!existing) return { status: 404, error: "Product not found." };

      const parsed = parseProductInput(body, existing);
      if (parsed.error || !parsed.product) {
        return { status: 400, error: parsed.error };
      }
      const updated = {
        ...parsed.product,
        slug: uniqueSlug(parsed.product, db.products)
      };
      db.products = db.products.map((item) =>
        item.id === id ? updated : item
      );
      return { status: 200, product: updated };
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }
    return NextResponse.json({ product: result.product });
  } catch {
    return NextResponse.json({ error: "Could not update product." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await mutateDb((db) => {
    const exists = db.products.some((item) => item.id === id);
    if (!exists) return false;
    db.products = db.products.filter((item) => item.id !== id);
    return true;
  });

  if (!deleted) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
