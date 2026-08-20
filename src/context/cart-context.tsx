"use client";

import * as React from "react";
import type { Product } from "@/types";

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  brand: string;
  slug: string;
  size: string;
  unitPrice: number;
  image: string | null;
  stock: number;
  quantity: number;
}

export interface SavedItem extends CartItem {
  savedAt: string;
}

interface CartContextValue {
  items: CartItem[];
  saved: SavedItem[];
  count: number;
  subtotal: number;
  addItem: (product: Product, variantId: string, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  saveForLater: (variantId: string) => void;
  moveToCart: (variantId: string) => void;
  removeSaved: (variantId: string) => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

const CART_KEY = "elane-cart";
const SAVED_KEY = "elane-saved";

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [saved, setSaved] = React.useState<SavedItem[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    // Hydrate cart/saved from localStorage once on mount (client-only).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(load<CartItem[]>(CART_KEY, []));
     
    setSaved(load<SavedItem[]>(SAVED_KEY, []));
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, ready]);

  React.useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [saved, ready]);

  const addItem = React.useCallback(
    (product: Product, variantId: string, quantity = 1) => {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) return;
      setItems((prev) => {
        const existing = prev.find((i) => i.variantId === variantId);
        if (existing) {
          return prev.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(i.quantity + quantity, Math.max(variant.stock, 1)) }
              : i
          );
        }
        const image = product.images[0]?.url ?? null;
        const item: CartItem = {
          productId: product.id,
          variantId,
          name: product.name,
          brand: product.brand,
          slug: product.slug,
          size: variant.size,
          unitPrice: variant.salePrice ?? variant.price,
          image,
          stock: variant.stock,
          quantity,
        };
        return [...prev, item];
      });
      setSaved((prev) => prev.filter((s) => s.variantId !== variantId));
      setIsOpen(true);
    },
    []
  );

  const removeItem = React.useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const updateQuantity = React.useCallback((variantId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.variantId !== variantId)
        : prev.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, Math.max(i.stock, 1)) }
              : i
          )
    );
  }, []);

  const clearCart = React.useCallback(() => setItems([]), []);

  const saveForLater = React.useCallback((variantId: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.variantId === variantId);
      if (item) {
        setSaved((savedPrev) => [
          { ...item, savedAt: new Date().toISOString() },
          ...savedPrev.filter((s) => s.variantId !== variantId),
        ]);
      }
      return prev.filter((i) => i.variantId !== variantId);
    });
  }, []);

  const moveToCart = React.useCallback((variantId: string) => {
    setSaved((prev) => {
      const item = prev.find((s) => s.variantId === variantId);
      if (item) {
        const { savedAt: _savedAt, ...cartItem } = item;
        void _savedAt;
        setItems((itemsPrev) => {
          const existing = itemsPrev.find((i) => i.variantId === variantId);
          if (existing) {
            return itemsPrev.map((i) =>
              i.variantId === variantId
                ? { ...i, quantity: i.quantity + cartItem.quantity }
                : i
            );
          }
          return [...itemsPrev, cartItem];
        });
      }
      return prev.filter((s) => s.variantId !== variantId);
    });
  }, []);

  const removeSaved = React.useCallback((variantId: string) => {
    setSaved((prev) => prev.filter((s) => s.variantId !== variantId));
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const value: CartContextValue = {
    items,
    saved,
    count,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    saveForLater,
    moveToCart,
    removeSaved,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}