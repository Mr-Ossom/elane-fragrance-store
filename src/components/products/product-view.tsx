"use client";

import * as React from "react";
import {
  Check,
  MessageCircle,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/toast-context";
import { formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/brand";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { ProductGallery } from "@/components/products/product-gallery";
import { RatingStars } from "@/components/rating-stars";
import { QuantitySelector } from "@/components/quantity-selector";
import { WishlistButton } from "@/components/wishlist-button";
import { buildWhatsAppProductMessage } from "@/components/whatsapp-button";
import { Badge } from "@/components/ui/badge";

interface ProductViewProps {
  product: Product;
}

export function ProductView({ product }: ProductViewProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [variantId, setVariantId] = React.useState(product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = React.useState(1);

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const outOfStock = !variant || variant.stock <= 0;
  const price = variant?.salePrice ?? variant?.price ?? 0;
  const lowStock = variant != null && variant.stock > 0 && variant.stock <= 5;

  React.useEffect(() => {
    track("product_viewed", { productId: product.id, slug: product.slug });
  }, [product.id, product.slug]);

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <ProductGallery images={product.images} name={product.name} />

      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-champagne-deep">
              {product.brand}
            </p>
            <h1 className="mt-1 text-4xl leading-tight sm:text-5xl">{product.name}</h1>
          </div>
          <WishlistButton product={product} />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <RatingStars rating={product.rating} showValue reviewCount={product.reviewCount} />
          <span className="text-sm text-muted-foreground">
            <a href="#reviews" className="underline-offset-2 hover:underline">
              {product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}
            </a>
          </span>
        </div>

        <div className="mt-5 flex items-end gap-3">
          <span className="text-3xl font-medium">{formatPrice(price)}</span>
          {variant && variant.salePrice != null && variant.salePrice < variant.price && (
            <>
              <span className="text-lg text-muted-foreground line-through">{formatPrice(variant.price)}</span>
              <Badge variant="success">
                Save {formatPrice(variant.price - variant.salePrice)}
              </Badge>
            </>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          {outOfStock ? (
            <Badge variant="destructive">Currently out of stock</Badge>
          ) : lowStock ? (
            <Badge variant="outline" className="text-orange-700">
              Only {variant!.stock} left in stock
            </Badge>
          ) : (
            <Badge variant="success">In stock · Ready to dispatch</Badge>
          )}
        </div>

        {/* Size selection */}
        {product.variants.length > 1 && (
          <fieldset className="mt-7">
            <legend className="mb-2.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Select size
            </legend>
            <div className="flex flex-wrap gap-2.5">
              {product.variants.map((v) => {
                const selected = v.id === variantId;
                const soldOut = v.stock <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={soldOut}
                    onClick={() => {
                      setVariantId(v.id);
                      setQuantity(1);
                    }}
                    aria-pressed={selected}
                    className={cn(
                      "min-w-20 rounded-sm border px-4 py-2.5 text-sm transition-colors",
                      selected
                        ? "border-champagne bg-champagne/10 font-medium"
                        : "border-border hover:border-accent",
                      soldOut && "opacity-40 line-through"
                    )}
                  >
                    <span className="block font-medium">{v.size}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {formatPrice(v.salePrice ?? v.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {/* Qty */}
        <div className="mt-6 flex items-center gap-4">
          <QuantitySelector value={quantity} onChange={setQuantity} max={variant?.stock ?? 99} />
          <span className="text-sm text-muted-foreground">
            {variant?.stock ?? 0} available
          </span>
        </div>

        {/* CTAs */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={outOfStock}
            onClick={() => {
              if (!variant) return;
              addItem(product, variant.id, quantity);
              track("product_added_to_cart", { productId: product.id, variantId: variant.id, quantity });
              toast(`${product.name} (${variant.size}) added to cart`);
            }}
            className="inline-flex h-13 items-center justify-center rounded-sm bg-primary px-6 py-3.5 text-sm font-medium uppercase tracking-wide text-primary-foreground transition-colors hover:bg-espresso disabled:opacity-50"
          >
            Add to Cart — {formatPrice(price * quantity)}
          </button>
          <a
            href={whatsappLink(
              buildWhatsAppProductMessage({
                productName: product.name,
                brand: product.brand,
                variantSize: variant?.size,
                quantity,
                price: price * quantity,
              })
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-13 items-center justify-center gap-2 rounded-sm border border-[#25D366]/40 bg-[#25D366]/10 px-6 py-3.5 text-sm font-medium uppercase tracking-wide text-[#128C7E] transition-colors hover:bg-[#25D366]/20"
          >
            <MessageCircle size={16} />
            Order via WhatsApp
          </a>
        </div>

        <div className="mt-5 text-sm text-muted-foreground">
          <Check size={14} className="mr-1 inline text-emerald-700" />
          Pay with MTN MoMo, Telecel Cash, AirtelTigo Money, Visa or Mastercard
        </div>

        {/* Trust chips */}
        <ul className="mt-7 grid gap-3 rounded-sm border border-border bg-card p-4 text-sm sm:grid-cols-2">
          {[
            { icon: ShieldCheck, label: "100% authentic, verified stock" },
            { icon: Truck, label: `Delivery from ${formatPrice(25)} (Accra & Tema)` },
            { icon: RefreshCcw, label: "7-day simple returns" },
            { icon: PackageCheck, label: "Secure, discreet packaging" },
          ].map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5 text-foreground/85">
              <Icon size={17} className="shrink-0 text-champagne-deep" strokeWidth={1.5} />
              {label}
            </li>
          ))}
        </ul>

        {/* Description */}
        <div className="mt-7">
          <h2 className="text-xl">About this fragrance</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">{product.description}</p>
        </div>

        {/* Fragrance notes */}
        <div className="mt-7 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-3">
          {[
            { title: "Top Notes", notes: product.topNotes },
            { title: "Heart Notes", notes: product.heartNotes },
            { title: "Base Notes", notes: product.baseNotes },
          ].map(({ title, notes }) => (
            <div key={title} className="bg-card p-4">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {title}
              </h3>
              <p className="mt-1.5 text-sm font-medium">{notes.join(", ")}</p>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="mt-7">
          <h2 className="text-xl">Fragrance details</h2>
          <dl className="mt-3 divide-y divide-border text-sm">
            <div className="flex justify-between py-2.5">
              <dt className="text-muted-foreground">Family</dt>
              <dd className="font-medium">{product.fragranceFamily}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-muted-foreground">Gender</dt>
              <dd className="font-medium capitalize">{product.gender}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-muted-foreground">Longevity</dt>
              <dd className="font-medium">{product.longevity ?? "—"}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-muted-foreground">Sillage</dt>
              <dd className="font-medium">{product.sillage ?? "—"}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-muted-foreground">Best for</dt>
              <dd className="text-right font-medium">{product.occasion ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}