import { NextResponse } from "next/server";
import { readDb, mutateDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await readDb();
    const product = db.products.find((p) => p.id === id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const reviews = db.reviews.filter((r) => r.productId === id);
    return NextResponse.json({ reviews, productRating: product.rating, productReviewCount: product.reviewCount });
  } catch {
    return NextResponse.json({ error: "Could not fetch reviews" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as {
      rating?: number;
      title?: string;
      comment?: string;
    };

    const rating = Number(body.rating);
    const title = String(body.title ?? "").trim();
    const comment = String(body.comment ?? "").trim();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    if (!title || title.length < 2) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!comment || comment.length < 10) {
      return NextResponse.json({ error: "Comment must be at least 10 characters" }, { status: 400 });
    }

    const db = await readDb();
    const product = db.products.find((p) => p.id === id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existingReview = db.reviews.find((r) => r.productId === id && r.userId === user.id);
    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 409 });
    }

    const hasPurchased = db.orders.some(
      (order) =>
        order.customer.email === user.email &&
        order.status !== "cancelled" &&
        order.items.some((item) => item.productId === id)
    );

    const review = {
      id: `rev-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
      productId: id,
      userId: user.id,
      userName: user.name,
      rating,
      title,
      comment,
      verified: hasPurchased,
      createdAt: new Date().toISOString()
    };

    await mutateDb((db) => {
      db.reviews.push(review);
      const productReviews = db.reviews.filter((r) => r.productId === id);
      const productIdx = db.products.findIndex((p) => p.id === id);
      if (productIdx !== -1) {
        db.products[productIdx].reviewCount = productReviews.length;
        db.products[productIdx].rating =
          productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
      }
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create review" }, { status: 500 });
  }
}