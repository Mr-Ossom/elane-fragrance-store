"use client";

import * as React from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

interface AddToCartButtonProps {
  product: Product;
  variantId: string;
  quantity?: number;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export function AddToCartButton({
  product,
  variantId,
  quantity = 1,
  className,
  children,
  disabled,
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();
  const { toast } = useToast();

  const variant = product.variants.find((v) => v.id === variantId);
  const outOfStock = !variant || variant.stock <= 0;

  return (
    <button
      type="button"
      disabled={disabled || outOfStock}
      onClick={() => {
        addItem(product, variantId, quantity);
        track("product_added_to_cart", { productId: product.id, variantId, quantity });
        toast(`${product.name} added to cart`);
        openCart();
      }}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-medium uppercase tracking-wide text-primary-foreground transition-all hover:bg-espresso active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      <ShoppingBag size={16} strokeWidth={1.75} />
      {outOfStock ? "Out of Stock" : children ?? "Add to Cart"}
    </button>
  );
}