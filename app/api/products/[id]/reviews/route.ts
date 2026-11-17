import { NextResponse } from "next/server";
import { readDb, mutateDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getTranslator } from "@/lib/i18n-server";
import type { Review } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await readDb();
    const product = db.products.find((p) => p.id === id && p.isActive);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    const reviews = db.reviews
      .filter((review) => review.productId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(({ userId: _userId, ...review }) => review);
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: "Could not fetch reviews." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { tr } = await getTranslator();
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: tr("Log in to write a review.", "Ingia kwanza ili kuandika maoni.") },
        { status: 401 }
      );
    }

    const { id } = await params;
    let body: { rating?: number; title?: string; comment?: string };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ error: tr("Invalid request.", "Ombi si sahihi.") }, { status: 400 });
    }

    const rating = Math.round(Number(body.rating));
    const title = String(body.title ?? "").trim();
    const comment = String(body.comment ?? "").trim();

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: tr("Choose 1 to 5 stars.", "Chagua nyota 1 hadi 5.") }, { status: 400 });
    }
    if (title.length < 2 || title.length > 100) {
      return NextResponse.json(
        { error: tr("Add a short title (2–100 characters).", "Weka kichwa kifupi (herufi 2–100).") },
        { status: 400 }
      );
    }
    if (comment.length < 10 || comment.length > 2000) {
      return NextResponse.json(
        {
          error: tr(
            "Your review should be 10 to 2,000 characters.",
            "Maoni yako yawe na herufi kati ya 10 na 2,000."
          )
        },
        { status: 400 }
      );
    }

    const result = await mutateDb((db) => {
      const product = db.products.find((p) => p.id === id && p.isActive);
      if (!product) {
        return { status: 404, error: tr("Product not found.", "Bidhaa haikupatikana.") };
      }
      if (db.reviews.some((r) => r.productId === id && r.userId === user.id)) {
        return {
          status: 409,
          error: tr("You have already reviewed this product.", "Tayari umeandika maoni kuhusu bidhaa hii.")
        };
      }

      const verified = db.orders.some(
        (order) =>
          (order.userId === user.id || order.customer.email === user.email) &&
          order.status !== "cancelled" &&
          order.items.some((item) => item.productId === id)
      );

      const review: Review = {
        id: `rev-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        productId: id,
        userId: user.id,
        userName: user.name,
        rating,
        title,
        comment,
        verified,
        createdAt: new Date().toISOString()
      };
      db.reviews.push(review);

      const productReviews = db.reviews.filter((r) => r.productId === id);
      product.reviewCount = productReviews.length;
      product.rating =
        Math.round((productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length) * 10) / 10;
      const { userId: _userId, ...publicReview } = review;
      return {
        status: 201,
        review: publicReview,
        productRating: product.rating,
        productReviewCount: product.reviewCount
      };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: tr("Could not save your review. Please try again.", "Imeshindwa kuhifadhi maoni yako. Tafadhali jaribu tena.") },
      { status: 500 }
    );
  }
}
