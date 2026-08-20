"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/format";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function CartPageClient() {
  const { items, saved, subtotal, updateQuantity, removeItem, saveForLater, moveToCart } = useCart();

  return (
    <div className="container-site py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Your Bag" }]} />
      <h1 className="text-4xl sm:text-5xl">Your Bag</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={24} />}
          title="Your bag is empty"
          description="Nothing here yet. Explore the collection and find your signature scent."
          action={
            <Button asChild size="lg">
              <Link href="/shop">
                Shop Collection
                <ArrowRight size={15} />
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <ul className="divide-y divide-border rounded-sm border border-border bg-card px-4">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-5">
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative h-32 w-28 shrink-0 overflow-hidden rounded-sm bg-secondary"
                  >
                    <Image
                      src={item.image ?? "/images/products/hero.svg"}
                      alt={item.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-champagne-deep">
                          {item.brand}
                        </p>
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-serif text-xl font-semibold leading-tight hover:underline"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-sm text-muted-foreground">Size: {item.size}</p>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(item.unitPrice)}</span>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                      <div className="flex items-center gap-1 rounded-sm border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          aria-label="Quantity"
                          value={item.quantity}
                          min={1}
                          onChange={(e) => updateQuantity(item.variantId, parseInt(e.target.value, 10) || 1)}
                          className="h-9 w-12 border-x border-border bg-transparent text-center text-sm outline-none"
                        />
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <button
                          type="button"
                          onClick={() => saveForLater(item.variantId)}
                          className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        >
                          Save for later
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.variantId)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {saved.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xl">Saved for later</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {saved.map((item) => (
                    <li key={item.variantId} className="flex items-center gap-3 rounded-sm border border-dashed border-border p-3">
                      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm bg-secondary">
                        <Image src={item.image ?? "/images/products/hero.svg"} alt={item.name} fill sizes="56px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.name}</p>
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
              </section>
            )}
          </div>

          <aside>
            <div className="sticky top-28 rounded-sm border border-border bg-card p-5">
              <h2 className="font-serif text-xl font-semibold">Order Summary</h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="font-medium">Calculated at checkout</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd className="font-medium text-emerald-700">—</dd>
                </div>
              </dl>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estimated total</span>
                <span className="text-lg font-medium">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Delivery fees are charged per delivery zone (Accra &amp; Tema same-day, nationwide within 1–4 days).
              </p>
              <Button asChild size="lg" className="mt-5 w-full">
                <Link href="/checkout">
                  Checkout Securely
                  <ArrowRight size={15} />
                </Link>
              </Button>
              <button
                type="button"
                onClick={() => (window.location.href = "https://wa.me/233200000000")}
                className="mt-3 w-full text-center text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Prefer WhatsApp? Order directly with our team.
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}