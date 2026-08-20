import { BadgeCheck, Star } from "lucide-react";
import type { Review } from "@/types";
import { RatingStars } from "@/components/rating-stars";
import { formatDate } from "@/lib/format";

interface ReviewsSectionProps {
  productId: string;
  productSlug: string;
  productName: string;
  reviews: Review[];
}

export function ReviewsSection({ productId, productSlug, productName, reviews }: ReviewsSectionProps) {
  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <section id="reviews" className="mt-16 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-3xl">Customer Reviews</h2>
          <div className="mt-2 flex items-center gap-2">
            <RatingStars rating={average} size={16} showValue />
            <span className="text-sm text-muted-foreground">
              based on {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <a
          href={`/account?review=${productSlug}&productId=${productId}&name=${encodeURIComponent(productName)}`}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-champagne-deep"
        >
          <Star size={15} />
          Write a review
        </a>
      </div>

      {reviews.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">
          Be the first to review {productName}. Only verified purchasers receive a Verified Purchase badge.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 lg:grid-cols-2">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-sm border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <RatingStars rating={review.rating} />
                <time className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</time>
              </div>
              {review.title && <h3 className="mt-3 font-serif text-lg font-semibold">{review.title}</h3>}
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">{review.content}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <p className="text-sm font-medium">{review.customerName}</p>
                {review.verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <BadgeCheck size={14} />
                    Verified Purchase
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}