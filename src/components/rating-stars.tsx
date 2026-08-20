import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
  reviewCount?: number;
}

export function RatingStars({ rating, size = 14, className, showValue = false, reviewCount }: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const roundedHalf = rating - fullStars >= 0.75;

  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label={`Rated ${rating} out of 5`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars + (roundedHalf ? 1 : 0) }).map((_, i) => (
          <Star key={i} size={size} className="fill-champagne text-champagne" strokeWidth={1} />
        ))}
        {hasHalf && <StarHalf size={size} className="fill-champagne text-champagne" strokeWidth={1} />}
        {Array.from({ length: Math.max(0, 5 - (fullStars + (roundedHalf ? 1 : 0)) - (hasHalf ? 1 : 0)) }).map((_, i) => (
          <Star key={`e-${i}`} size={size} className="text-border" strokeWidth={1} />
        ))}
      </div>
      {showValue && <span className="text-sm text-muted-foreground">{rating.toFixed(1)}</span>}
      {reviewCount != null && (
        <span className="text-sm text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  );
}