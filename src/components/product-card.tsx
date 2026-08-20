"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/price-display";
import { RatingStars } from "@/components/rating-stars";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/wishlist-button";
import { track } from "@/lib/analytics";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority, className }: ProductCardProps) {
  const { addItem } = useCart();
  const primaryVariant = product.variants[0];
  const hasDiscount =
    primaryVariant?.salePrice != null && primaryVariant.salePrice < primaryVariant.price;
  const minPrice = Math.min(...product.variants.map((v) => v.salePrice ?? v.price));
  const hasMultiplePrices = product.variants.some(
    (v) => (v.salePrice ?? v.price) !== minPrice
  );
  const outOfStock = product.variants.every((v) => v.stock <= 0);

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative overflow-hidden rounded-sm bg-secondary">
        {hasDiscount && (
          <Badge variant="accent" className="absolute left-3 top-3 z-10">
            -{Math.round(((primaryVariant!.price - primaryVariant!.salePrice!) / primaryVariant!.price) * 100)}%
          </Badge>
        )}
        {outOfStock ? (
          <Badge variant="destructive" className="absolute left-3 top-3 z-10">
            Out of Stock
          </Badge>
        ) : product.bestseller ? (
          <Badge variant="outline" className="absolute left-3 top-3 z-10 bg-background/90 backdrop-blur-sm">
            Best Seller
          </Badge>
        ) : product.newArrival ? (
          <Badge variant="outline" className="absolute left-3 top-3 z-10 bg-background/90 backdrop-blur-sm">
            New
          </Badge>
        ) : null}

        <Link
          href={`/products/${product.slug}`}
          tabIndex={-1}
          aria-label={`View ${product.name}`}
          className="block aspect-square"
        >
          <Image
            src={product.images[0]?.url ?? "/images/products/hero.svg"}
            alt={product.images[0]?.alt ?? product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        <div className="absolute right-3 top-3 z-10">
          <WishlistButton product={product} />
        </div>

        {!outOfStock && (
          <button
            type="button"
            aria-label={`Quick add ${product.name}`}
            onClick={() => {
              addItem(product, primaryVariant!.id, 1);
              track("product_added_to_cart", { productId: product.id, variantId: primaryVariant!.id, source: "quick-add" });
            }}
            className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-card/95 text-foreground opacity-0 shadow-md transition-all hover:bg-primary hover:text-primary-foreground focus-visible:opacity-100 group-hover:opacity-100"
          >
            <ShoppingBag size={17} strokeWidth={1.75} />
            <span className="sr-only">Add to cart</span>
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        <Link href={`/products/${product.slug}`} className="group/link">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-champagne-deep">
            {product.brand}
          </p>
          <h3 className="text-editorial text-lg font-semibold leading-tight transition-colors group-hover/link:text-champagne-deep">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{primaryVariant?.size}</span>
          {hasMultiplePrices && <span aria-hidden>·</span>}
          {hasMultiplePrices && <span>from</span>}
        </div>
        <div className="mt-1 flex items-end justify-between gap-2">
          <PriceDisplay
            price={primaryVariant?.price ?? 0}
            salePrice={primaryVariant?.salePrice}
          />
          <RatingStars rating={product.rating} showValue />
        </div>
      </div>
    </article>
  );
}