"use client";

import { useEffect, useState } from "react";
import { Star, Send, Loader2, AlertCircle } from "lucide-react";
import { useStore } from "@/components/store-context";
import { cn, formatDate } from "@/lib/utils";
import { Rating } from "@/components/rating";

type Review = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  createdAt: string;
};

type AccountUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
};

export function ProductReviews({
  productId,
  initialRating,
  initialReviewCount
}: {
  productId: string;
  initialRating: number;
  initialReviewCount: number;
}) {
  const { language } = useStore();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(initialRating);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: ""
  });
  const [error, setError] = useState("");
  const [ratingBreakdown] = useState(
    [5, 4, 3, 2, 1].map((star) => ({
      star,
      percent:
        star === Math.round(initialRating)
          ? 62
          : star === Math.round(initialRating) - 1
            ? 24
            : star === Math.round(initialRating) - 2
              ? 9
              : star === Math.round(initialRating) - 3
                ? 3
                : 2
    }))
  );

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user ?? null);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  useEffect(() => {
    fetch(`/api/products/${productId}/reviews`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setRating(data.productRating || initialRating);
        setReviewCount(data.productReviewCount || initialReviewCount);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [productId, initialRating, initialReviewCount]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      setError(language === "sw" ? "Tafadhali ingia kwanza ili kuandika uvuruguzi." : "Please sign in to write a review.");
      return;
    }
    if (!formData.title.trim() || formData.title.length < 2) {
      setError(language === "sw" ? "Kichwa ni lazima." : "Title is required.");
      return;
    }
    if (!formData.comment.trim() || formData.comment.length < 10) {
      setError(language === "sw" ? "Uvuruguzi lazima uwe na angalau herufi 10." : "Review must be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: formData.rating,
          title: formData.title.trim(),
          comment: formData.comment.trim()
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit review");
      setReviews((prev) => [data.review, ...prev]);
      setRating(data.productRating);
      setReviewCount(data.productReviewCount);
      setFormData({ rating: 5, title: "", comment: "" });
      setShowForm(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="border-t border-zinc-200 pt-5">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-brand-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-zinc-200 pt-5">
      <div role="tablist" aria-label="Product reviews" className="mb-6">
        <button
          role="tab"
          aria-selected={true}
          className="relative pb-3 text-xs font-semibold capitalize text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand-700"
        >
          Reviews ({reviewCount})
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-[190px_1fr]">
        <div className="text-center sm:text-left">
          <p className="font-display text-4xl font-extrabold text-ink">{rating.toFixed(1)}</p>
          <Rating rating={rating} reviewCount={reviewCount} className="mt-1 justify-center sm:justify-start" />
          <p className="mt-2 text-[11px] text-zinc-400">
            Based on {reviewCount} verified reviews
          </p>
        </div>
        <div className="space-y-1.5">
          {ratingBreakdown.map((item) => (
            <div key={item.star} className="flex items-center gap-2 text-[10px]">
              <span className="flex w-8 items-center gap-0.5 text-zinc-500">
                {item.star}
                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
              <span className="w-7 text-right text-zinc-400">{item.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {user && (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
          <h3 className="font-display text-lg font-extrabold">
            {showForm ? "Write your review" : "Share your experience"}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Your feedback helps other shoppers make better decisions.
          </p>

          {showForm ? (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-2">
                  Your Rating
                </label>
                <div className="flex items-center gap-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                      className={cn(
                        "p-1 transition",
                        formData.rating >= star ? "text-amber-400" : "text-zinc-300"
                      )}
                      aria-label={`${star} stars`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="review-title" className="block text-xs font-semibold text-zinc-700 mb-1">
                  Title
                </label>
                <input
                  id="review-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="field text-xs"
                  placeholder={language === "sw" ? "Mfano: Bidhaa nzuri sana!" : "e.g. Amazing product!"}
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label htmlFor="review-comment" className="block text-xs font-semibold text-zinc-700 mb-1">
                  Your Review
                </label>
                <textarea
                  id="review-comment"
                  value={formData.comment}
                  onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                  className="field text-xs min-h-[100px] resize-y"
                  placeholder={language === "sw" ? "Eleza uzoefu wako..." : "Describe your experience..."}
                  minLength={10}
                  maxLength={2000}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {language === "sw" ? "Inatuma..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {language === "sw" ? "Tuma Uvuruguzi" : "Submit Review"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xs font-semibold text-zinc-500 hover:text-brand-700"
                >
                  {language === "sw" ? "Ghairi" : "Cancel"}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary mt-4"
            >
              <Star className="h-4 w-4 mr-2 fill-amber-400 text-amber-400" />
              {language === "sw" ? "Andika Uvuruguzi" : "Write a Review"}
            </button>
          )}
        </div>
      )}

      {reviews.length === 0 && (
        <div className="mt-6 text-center py-10">
          <p className="text-sm text-zinc-500">
            {language === "sw"
              ? "Hakuna miarango hata moja bado. Kuwa mwanzo kuandika!"
              : "No reviews yet. Be the first to write one!"}
          </p>
        </div>
      )}

      <div className="mt-6 space-y-5">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="border-t border-zinc-100 pt-4 first:border-t-0 first:pt-0"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-ink">
                  {review.userName}
                  {review.verified && (
                    <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[9px] font-medium text-brand-700">
                      Verified buyer
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {formatDate(review.createdAt)}
                </p>
              </div>
              <Rating rating={review.rating} compact />
            </div>
            <p className="mt-2 text-xs font-semibold text-ink">{review.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600">{review.comment}</p>
          </article>
        ))}
      </div>
    </div>
  );
}