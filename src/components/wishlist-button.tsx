"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { useToast } from "@/context/toast-context";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

interface WishlistButtonProps {
  product: Product;
  className?: string;
  variant?: "icon" | "text";
}

export function WishlistButton({ product, className, variant = "icon" }: WishlistButtonProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const active = isWishlisted(product.id);

  return (
    <button
      type="button"
      aria-label={active ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      aria-pressed={active}
      onClick={() => {
        toggleWishlist(product);
        if (!active) {
          track("wishlist_added", { productId: product.id });
          toast(`${product.name} saved to wishlist`);
        }
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full border bg-background/90 p-2 text-muted-foreground shadow-sm transition-all hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active && "border-champagne/60 text-champagne-deep",
        className
      )}
    >
      <Heart size={17} strokeWidth={1.75} className={cn(active && "fill-champagne text-champagne")} />
      {variant === "text" && <span className="ml-1.5 text-xs font-medium">Wishlist</span>}
    </button>
  );
}