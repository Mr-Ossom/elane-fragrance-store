import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  salePrice?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PriceDisplay({ price, salePrice, className, size = "md" }: PriceDisplayProps) {
  const current = salePrice ?? price;
  const hasDiscount = salePrice != null && salePrice < price;
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span
        className={cn(
          "font-medium text-foreground",
          size === "lg" && "text-2xl",
          size === "md" && "text-lg",
          size === "sm" && "text-base"
        )}
      >
        {formatPrice(current)}
      </span>
      {hasDiscount && (
        <span
          className={cn(
            "text-muted-foreground line-through",
            size === "lg" && "text-base",
            size === "md" && "text-sm",
            size === "sm" && "text-xs"
          )}
        >
          {formatPrice(price)}
        </span>
      )}
      {hasDiscount && discountPercent(price, salePrice!) > 0 && (
        <span
          className={cn(
            "font-medium text-emerald-700",
            size === "lg" && "text-sm",
            size === "md" && "text-xs"
          )}
        >
          -{discountPercent(price, salePrice!)}%
        </span>
      )}
    </div>
  );
}

function discountPercent(price: number, salePrice: number): number {
  return Math.round(((price - salePrice) / price) * 100);
}