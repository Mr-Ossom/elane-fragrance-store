import { BadgeCheck, Quote } from "lucide-react";
import type { Review } from "@/types";
import { SectionHeading } from "@/components/section-heading";
import { RatingStars } from "@/components/rating-stars";

export function CustomerReviews({ reviews }: { reviews: Review[] }) {
  return (
    <section className="container-site py-16 sm:py-20">
      <SectionHeading
        eyebrow="Verified Customers"
        title="Loved Across Ghana"
        description="Real reviews from verified purchasers in Accra, Kumasi, Takoradi and beyond."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.slice(0, 6).map((review) => (
          <figure
            key={review.id}
            className="flex flex-col rounded-sm border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between">
              <RatingStars rating={review.rating} />
              <Quote size={22} className="text-secondary-foreground/30" />
            </div>
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
              “{review.content}”
            </blockquote>
            <figcaption className="mt-5 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{review.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    Purchased: {review.productName}
                  </p>
                </div>
                {review.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                    <BadgeCheck size={14} />
                    Verified Purchase
                  </span>
                )}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}