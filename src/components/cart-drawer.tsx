"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const {
    items,
    saved,
    subtotal,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    saveForLater,
    moveToCart,
  } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(open: boolean) => !open && closeCart()}>
      <SheetContent side="right">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag size={17} strokeWidth={1.75} />
              Your Bag
              {items.length > 0 && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  ({items.reduce((n, i) => n + i.quantity, 0)})
                </span>
              )}
            </SheetTitle>
            <SheetClose className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground">
              <X size={18} />
              <span className="sr-only">Close cart</span>
            </SheetClose>
          </div>
        </SheetHeader>

        <SheetBody>
          {items.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag size={24} />}
              title="Your bag is empty"
              description="Add a fragrance to your bag to begin checkout."
              action={
                <Button asChild onClick={closeCart}>
                  <Link href="/shop">Shop Collection</Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-4">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="relative h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-secondary"
                  >
                    <Image
                      src={item.image ?? "/images/products/hero.svg"}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-champagne-deep">
                          {item.brand}
                        </p>
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="text-editorial font-semibold leading-tight"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.size}</p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeItem(item.variantId)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-sm border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => saveForLater(item.variantId)}
                      className="mt-2 self-start text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                      Save for later
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {saved.length > 0 && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Saved for later
              </p>
              <ul className="mt-2 divide-y divide-border">
                {saved.map((item) => (
                  <li key={item.variantId} className="flex items-center gap-3 py-3">
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-sm bg-secondary">
                      <Image
                        src={item.image ?? "/images/products/hero.svg"}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-tight">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} · {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => moveToCart(item.variantId)}
                      className="text-xs font-medium text-champagne-deep underline-offset-2 hover:underline"
                    >
                      Move to bag
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SheetBody>

        {items.length > 0 && (
          <SheetFooter>
            <div className="mb-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Delivery and discounts are calculated at checkout.
              </p>
            </div>
            <Button asChild size="lg" className="w-full" onClick={closeCart}>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full" onClick={closeCart}>
              <Link href="/cart">View Bag</Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}