"use client";

import * as React from "react";
import { Check, Loader2, X } from "lucide-react";
import type { Review } from "@/types";
import { adminModerateReview } from "@/app/actions/admin";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500" aria-label={`${rating} out of 5`}>
      {"★".repeat(rating)}
      <span className="text-border">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function ReviewsAdminClient({ reviews }: { reviews: Review[] }) {
  const [pending, setPending] = React.useState<string | null>(null);

  async function set(reviewId: string, approved: boolean) {
    setPending(reviewId);
    await adminModerateReview(reviewId, approved);
    setPending(null);
  }

  const pendingReviews = reviews.filter((r) => !r.approved);
  const activeReviews = reviews.filter((r) => r.approved);

  return (
    <div>
      <h1 className="text-2xl font-serif font-semibold">Review moderation</h1>

      {pendingReviews.length > 0 && (
        <section className="mt-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Awaiting approval</h2>
          <div className="mt-2 space-y-2">
            {pendingReviews.map((r) => (
              <ReviewCard key={r.id} review={r} pending={pending === r.id} onSet={set} />
            ))}
          </div>
        </section>
      )}

      {activeReviews.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Published</h2>
          <div className="mt-2 space-y-2">
            {activeReviews.map((r) => (
              <ReviewCard key={r.id} review={r} pending={pending === r.id} onSet={set} />
            ))}
          </div>
        </section>
      )}

      {reviews.length === 0 && (
        <div className="mt-6 rounded-sm border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No reviews yet.
        </div>
      )}
    </div>
  );
}

function ReviewCard({
  review,
  pending,
  onSet,
}: {
  review: Review;
  pending: boolean;
  onSet: (id: string, approved: boolean) => void;
}) {
  return (
    <div className="rounded-sm border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{review.customerName}</span>
            <Stars rating={review.rating} />
          </div>
          <p className="text-xs text-muted-foreground">
            {review.productName} · {formatDate(review.createdAt)}
            {review.verified && <Badge variant="outline" className="ml-2">Verified</Badge>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pending ? (
            <Loader2 size={15} className="animate-spin text-muted-foreground" />
          ) : review.approved ? (
            <button
              type="button"
              onClick={() => onSet(review.id, false)}
              className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
            >
              <X size={13} /> Unpublish
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSet(review.id, true)}
              className="inline-flex items-center gap-1 rounded-sm bg-emerald-700 px-2.5 py-1 text-xs text-white hover:bg-emerald-800"
            >
              <Check size={13} /> Approve
            </button>
          )}
        </div>
      </div>
      {review.title && <p className="mt-2 text-sm font-medium">{review.title}</p>}
      <p className="mt-0.5 text-sm text-muted-foreground">{review.content}</p>
    </div>
  );
}