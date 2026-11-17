"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, BadgeCheck, Loader2, Send, Star } from "lucide-react";
import { useStore } from "@/components/store-context";
import { cn, formatDate } from "@/lib/utils";
import { Rating } from "@/components/rating";

type Review = {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  createdAt: string;
};

export function ProductReviews({ productId }: { productId: string }) {
  const { language, tr, user } = useStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, title: "", comment: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/products/${productId}/reviews`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data: { reviews?: Review[] }) => {
        if (active) setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      })
      .catch(() => active && setLoadFailed(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [productId]);

  // Summary and breakdown are calculated from the real reviews shown below.
  const summary = useMemo(() => {
    const count = reviews.length;
    const average = count ? reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0;
    const breakdown = [5, 4, 3, 2, 1].map((star) => {
      const matching = reviews.filter((review) => Math.round(review.rating) === star).length;
      return { star, count: matching, percent: count ? Math.round((matching / count) * 100) : 0 };
    });
    return { count, average, breakdown };
  }, [reviews]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (formData.title.trim().length < 2) {
      setError(tr("Add a short title.", "Weka kichwa kifupi."));
      return;
    }
    if (formData.comment.trim().length < 10) {
      setError(tr("Your review should be at least 10 characters.", "Maoni yako yawe na angalau herufi 10."));
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
      if (!response.ok) throw new Error(data.error || tr("Could not save your review.", "Imeshindwa kuhifadhi maoni yako."));
      setReviews((prev) => [data.review as Review, ...prev]);
      setFormData({ rating: 5, title: "", comment: "" });
      setShowForm(false);
    } catch (caught) {
      setError(
        caught instanceof TypeError
          ? tr("Could not connect. Check your internet and try again.", "Imeshindwa kuunganisha. Angalia intaneti yako kisha ujaribu tena.")
          : caught instanceof Error
            ? caught.message
            : tr("Could not save your review.", "Imeshindwa kuhifadhi maoni yako.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="container-shell scroll-mt-28 border-t border-zinc-200 py-12 lg:py-14">
      <h2 className="section-title">
        {tr("Customer reviews", "Maoni ya wateja")}
        {summary.count > 0 && <span className="ml-2 text-zinc-400">({summary.count})</span>}
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin text-brand-700" />
          {tr("Loading reviews…", "Inapakia maoni…")}
        </div>
      ) : loadFailed ? (
        <p className="py-8 text-sm text-zinc-600">
          {tr("Reviews could not be loaded right now.", "Maoni hayakuweza kupakiwa sasa hivi.")}
        </p>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-12">
          <div>
            {summary.count > 0 ? (
              <>
                <p className="font-display text-5xl font-extrabold text-ink">{summary.average.toFixed(1)}</p>
                <Rating rating={summary.average} reviewCount={summary.count} className="mt-2" />
                <div className="mt-5 space-y-2">
                  {summary.breakdown.map((item) => (
                    <div key={item.star} className="flex items-center gap-2 text-xs">
                      <span className="flex w-8 items-center gap-0.5 text-zinc-600">
                        {item.star}
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${item.percent}%` }} />
                      </div>
                      <span className="w-6 text-right text-zinc-500">{item.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-zinc-600">
                {tr("No reviews yet. Be the first to share your experience.", "Bado hakuna maoni. Kuwa wa kwanza kueleza uzoefu wako.")}
              </p>
            )}

            {!user ? (
              <p className="mt-6 rounded-xl bg-sand p-4 text-sm text-zinc-700">
                <Link href="/account" className="font-semibold text-brand-700 underline">
                  {tr("Log in", "Ingia")}
                </Link>{" "}
                {tr("to write a review.", "ili kuandika maoni.")}
              </p>
            ) : (
              !showForm && (
                <button type="button" onClick={() => setShowForm(true)} className="btn-primary mt-6">
                  <Star className="h-4 w-4" />
                  {tr("Write a review", "Andika maoni")}
                </button>
              )
            )}
          </div>

          <div>
            {user && showForm && (
              <form onSubmit={handleSubmit} noValidate className="mb-8 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
                <fieldset>
                  <legend className="label mb-2">{tr("Your rating", "Nyota zako")}</legend>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                        className={cn(
                          "grid h-11 w-11 place-items-center rounded-lg transition",
                          formData.rating >= star ? "text-amber-400" : "text-zinc-300 hover:text-amber-300"
                        )}
                        aria-label={tr(`${star} stars`, `Nyota ${star}`)}
                        aria-pressed={formData.rating === star}
                      >
                        <Star className="h-7 w-7 fill-current" />
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="review-title" className="label">
                    {tr("Title", "Kichwa")}
                  </label>
                  <input
                    id="review-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="field mt-1.5"
                    placeholder={tr("e.g. Good quality, fits well", "mfano: Ubora mzuri, inakaa vizuri")}
                    maxLength={100}
                  />
                </div>

                <div>
                  <label htmlFor="review-comment" className="label">
                    {tr("Your review", "Maoni yako")}
                  </label>
                  <textarea
                    id="review-comment"
                    value={formData.comment}
                    onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                    className="field mt-1.5 min-h-[110px] resize-y"
                    placeholder={tr("How was the quality, size and delivery?", "Ubora, saizi na usafirishaji vilikuwaje?")}
                    maxLength={2000}
                  />
                </div>

                {error && (
                  <p role="alert" className="alert-error">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {submitting ? tr("Sending…", "Inatuma…") : tr("Submit review", "Tuma maoni")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setError("");
                    }}
                    className="px-3 py-3 text-sm font-semibold text-zinc-600 hover:text-brand-700"
                  >
                    {tr("Cancel", "Ghairi")}
                  </button>
                </div>
              </form>
            )}

            {reviews.length > 0 && (
              <ul className="divide-y divide-zinc-100">
                {reviews.map((review) => (
                  <li key={review.id} className="py-5 first:pt-0">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {review.userName}
                          {review.verified && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                              <BadgeCheck className="h-3 w-3" />
                              {tr("Verified buyer", "Amenunua")}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-zinc-500">{formatDate(review.createdAt, language)}</p>
                      </div>
                      <Rating rating={review.rating} compact />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-ink">{review.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-700">{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
