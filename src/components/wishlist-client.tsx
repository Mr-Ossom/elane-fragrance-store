"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export function WishlistClient({ products }: { products: Product[] }) {
  const { items, removeWishlist } = useWishlist();
  const { addItem } = useCart();
  const { toast } = useToast();

  const resolved = items
    .map((item) => ({
      item,
      product: products.find((p) => p.id === item.productId),
    }))
    .filter((entry): entry is { item: (typeof items)[number]; product: Product } => Boolean(entry.product));

  function moveToCart(product: Product) {
    const variant = product.variants[0];
    if (!variant) return;
    addItem(product, variant.id, 1);
    removeWishlist(product.id);
    toast(`${product.name} moved to your bag`);
  }

  return (
    <div className="container-site py-8">
      <h1 className="text-4xl sm:text-5xl">My Wishlist</h1>
      <p className="mt-2 text-muted-foreground">
        Your saved fragrances, ready when you are.
      </p>

      {resolved.length === 0 ? (
        <EmptyState
          icon={<Heart size={24} />}
          title="Your wishlist is empty"
          description="Tap the heart on any fragrance to save it here for later."
          action={
            <Button asChild>
              <Link href="/shop">Discover Fragrances</Link>
            </Button>
          }
        />
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resolved.map(({ item, product }) => {
            const variant = product.variants[0];
            const price = variant?.salePrice ?? variant?.price ?? item.price;
            return (
              <li key={item.productId} className="flex gap-4 rounded-sm border border-border bg-card p-4">
                <Link
                  href={`/products/${product.slug}`}
                  className="relative h-28 w-24 shrink-0 overflow-hidden rounded-sm bg-secondary"
                >
                  <Image
                    src={product.images[0]?.url ?? "/images/products/hero.svg"}
                    alt={product.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-champagne-deep">
                    {product.brand}
                  </p>
                  <Link
                    href={`/products/${product.slug}`}
                    className="mt-0.5 line-clamp-2 font-serif text-lg font-semibold leading-snug hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">{variant?.size}</p>
                  <p className="mt-1 font-medium">{formatPrice(price)}</p>
                  <div className="mt-auto flex items-center gap-2 pt-3">
                    <Button
                      size="sm"
                      variant="default"
                      disabled={!variant || variant.stock <= 0}
                      onClick={() => moveToCart(product)}
                    >
                      <ShoppingBag size={14} />
                      Add to Bag
                    </Button>
                    <Button
                      size="iconSm"
                      variant="ghost"
                      aria-label={`Remove ${product.name} from wishlist`}
                      onClick={() => removeWishlist(item.productId)}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}