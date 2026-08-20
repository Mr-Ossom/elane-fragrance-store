"use client";

import * as React from "react";
import type { Product } from "@/types";

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  image: string | null;
}

interface WishlistContextValue {
  items: WishlistItem[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeWishlist: (productId: string) => void;
  moveToCart: (productId: string) => void;
}

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

const KEY = "elane-wishlist";

function load(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<WishlistItem[]>([]);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    // Hydrate wishlist from localStorage once on mount (client-only).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(load());
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const toggleWishlist = React.useCallback((product: Product) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.productId === product.id);
      if (exists) return prev.filter((i) => i.productId !== product.id);
      const variant = product.variants[0];
      const item: WishlistItem = {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        price: variant ? (variant.salePrice ?? variant.price) : 0,
        image: product.images[0]?.url ?? null,
      };
      return [...prev, item];
    });
  }, []);

  const removeWishlist = React.useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const moveToCart = React.useCallback((productId: string) => {
    // The cart AddToCart flow is handled via the wishlist page which knows
    // the full product; this is a no-op holder kept for API stability.
    removeWishlist(productId);
  }, [removeWishlist]);

  const isWishlisted = React.useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  return (
    <WishlistContext.Provider
      value={{ items, isWishlisted, toggleWishlist, removeWishlist, moveToCart }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}