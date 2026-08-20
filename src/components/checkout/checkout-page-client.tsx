"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
  Truck,
} from "lucide-react";
import type { DeliveryZone } from "@/types";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/format";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  checkoutSchema,
  type CheckoutInput,
} from "@/lib/validations/schemas";
import { createCheckoutOrderAction, validateCouponAction } from "@/app/actions/checkout";
import { isPaystackConfigured } from "@/lib/paystack";

interface Errors {
  [key: string]: string;
}

const ghRegions = [
  "Greater Accra",
  "Ashanti",
  "Central",
  "Western",
  "Western North",
  "Volta",
  "Eastern",
  "Bono",
  "Bono East",
  "Ahafo",
  "Northern",
  "North East",
  "Savannah",
  "Upper East",
  "Upper West",
  "Oti",
];

export function CheckoutPageClient({ zones }: { zones: DeliveryZone[] }) {
  const { items, subtotal, clearCart } = useCart();

  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    email: "",
    region: "",
    city: "",
    address: "",
    note: "",
  });
  const [zoneId, setZoneId] = React.useState("");
  const [couponCode, setCouponCode] = React.useState("");
  const [coupon, setCoupon] = React.useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = React.useState("");
  const [couponLoading, setCouponLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");

  const zone = zones.find((z) => z.id === zoneId) ?? null;
  const selectedCities = zone?.cities ?? [];
  const discount = coupon?.discount ?? 0;
  const deliveryFee = zone?.fee ?? 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  React.useEffect(() => {
    track("checkout_started", { itemCount: items.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setField(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  async function applyCoupon() {
    setCouponError("");
    setCouponLoading(true);
    const result = await validateCouponAction(couponCode, subtotal);
    setCouponLoading(false);
    if (result.ok && result.discount > 0) {
      setCoupon({ code: result.code!, discount: result.discount });
    } else {
      setCoupon(null);
      setCouponError(result.message ?? "This coupon could not be applied.");
    }
  }

  function validate(): Errors {
    const result = checkoutSchema.safeParse({
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        name: i.name,
        brand: i.brand,
        slug: i.slug,
        size: i.size,
        image: i.image,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      })),
      customer: form,
      deliveryZoneId: zoneId,
      couponCode: coupon?.code ?? "",
    });
    if (result.success) return {};
    const map: Errors = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[issue.path.length - 1] ?? "form");
      if (!map[key]) map[key] = issue.message;
    }
    return map;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      document.getElementById(Object.keys(fieldErrors)[0])?.focus();
      return;
    }

    const input: CheckoutInput = {
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        name: i.name,
        brand: i.brand,
        slug: i.slug,
        size: i.size,
        image: i.image,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      })),
      customer: form,
      deliveryZoneId: zoneId,
      couponCode: coupon?.code ?? "",
    };

    setSubmitting(true);
    try {
      const result = await createCheckoutOrderAction(input);
      track("payment_initiated", { orderId: result.orderId, total: result.total });

      const initRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: result.orderId, email: form.email }),
      });
      const initJson = await initRes.json();
      if (!initRes.ok || !initJson.authorizationUrl) {
        throw new Error(initJson.error ?? "We couldn't start your payment. Please try again.");
      }
      clearCart();
      window.location.href = initJson.authorizationUrl;
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Please check your details and try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0 && !submitting) {
    return (
      <div className="container-site py-16 text-center">
        <h1 className="text-4xl">Your bag is empty</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Add a fragrance to your bag and come back to checkout.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/shop">
            Shop Collection <ArrowRight size={15} />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-site py-6 sm:py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/cart" className="hover:underline">
          Bag
        </Link>
        <span>/</span>
        <span className="text-foreground">Checkout</span>
      </div>
      <h1 className="mt-2 text-4xl sm:text-5xl">Checkout</h1>

      <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* Contact */}
          <section className="rounded-sm border border-border bg-card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">1</span>
              Your Details
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  className={cn(errors.name && "border-destructive")}
                />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="024 000 0000"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  aria-invalid={Boolean(errors.phone)}
                  className={cn(errors.phone && "border-destructive")}
                />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  className={cn(errors.email && "border-destructive")}
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>
          </section>

          {/* Delivery */}
          <section className="rounded-sm border border-border bg-card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">2</span>
              Delivery
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="zone">Delivery area</Label>
                <select
                  id="zone"
                  value={zoneId}
                  onChange={(e) => {
                    setZoneId(e.target.value);
                    setForm((f) => ({ ...f, city: "" }));
                    setErrors((e) => ({ ...e, deliveryZoneId: "" }));
                  }}
                  aria-invalid={Boolean(errors.deliveryZoneId)}
                  className={cn(
                    "h-10 w-full rounded-sm border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    errors.deliveryZoneId && "border-destructive"
                  )}
                >
                  <option value="">Select your delivery area</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} — {formatPrice(z.fee)} ({z.estimatedDays})
                    </option>
                  ))}
                </select>
                {errors.deliveryZoneId && (
                  <p className="mt-1 text-xs text-destructive">{errors.deliveryZoneId}</p>
                )}
              </div>
              <div>
                <Label htmlFor="city">City / Town</Label>
                <select
                  id="city"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  disabled={!zone}
                  aria-invalid={Boolean(errors.city)}
                  className={cn(
                    "h-10 w-full rounded-sm border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
                    errors.city && "border-destructive"
                  )}
                >
                  <option value="">{zone ? "Select city" : "Choose delivery area first"}</option>
                  {selectedCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city}</p>}
              </div>
              <div>
                <Label htmlFor="region">Region</Label>
                <select
                  id="region"
                  value={form.region}
                  onChange={(e) => setField("region", e.target.value)}
                  aria-invalid={Boolean(errors.region)}
                  className={cn(
                    "h-10 w-full rounded-sm border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    errors.region && "border-destructive"
                  )}
                >
                  <option value="">Select your region</option>
                  {ghRegions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                {errors.region && <p className="mt-1 text-xs text-destructive">{errors.region}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Delivery address</Label>
                <Input
                  id="address"
                  autoComplete="street-address"
                  placeholder="House number, street, landmark"
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  aria-invalid={Boolean(errors.address)}
                  className={cn(errors.address && "border-destructive")}
                />
                {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="note">Delivery instructions (optional)</Label>
                <Textarea
                  id="note"
                  rows={2}
                  placeholder="e.g. Call when you arrive at the gate."
                  value={form.note}
                  onChange={(e) => setField("note", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-sm border border-border bg-card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">3</span>
              Payment
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Pay securely with Paystack — we never store your card or mobile money details.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                { icon: Smartphone, label: "MTN MoMo" },
                { icon: Smartphone, label: "Telecel Cash" },
                { icon: Smartphone, label: "AirtelTigo Money" },
                { icon: CreditCard, label: "Visa / Mastercard" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-sm border border-border bg-secondary/40 p-3 text-center"
                >
                  <Icon size={20} className="text-champagne-deep" strokeWidth={1.5} />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-sm border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
              <Lock size={14} className="mt-0.5 shrink-0" />
              <span>
                Payment status is verified server-side before your order is marked paid. Order status only changes after
                successful verification.
              </span>
            </div>
            {!isPaystackConfigured && (
              <p className="mt-4 rounded-sm border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <strong>Development mode:</strong> Paystack API keys are not set yet, so payment will be simulated.
                Add <code>NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY</code> and <code>PAYSTACK_SECRET_KEY</code> to accept real
                payments.
              </p>
            )}
          </section>

          {submitError && (
            <p role="alert" className="rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Processing…
              </>
            ) : (
              <>
                <Lock size={15} />
                Pay {formatPrice(total)} Securely
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            You will be redirected to complete your payment. {form.phone && (
              <span>We may call {form.phone} to confirm delivery.</span>
            )}
          </p>
        </div>

        {/* Summary */}
        <aside>
          <div className="sticky top-28 space-y-4">
            <div className="rounded-sm border border-border bg-card p-5">
              <h2 className="font-serif text-xl font-semibold">Order Summary</h2>
              <ul className="mt-4 max-h-64 divide-y divide-border overflow-y-auto">
                {items.map((item) => (
                  <li key={item.variantId} className="flex items-center gap-3 py-3">
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-sm bg-secondary">
                      <Image src={item.image ?? "/images/products/hero.svg"} alt={item.name} fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              {/* Coupon */}
              <div className="mt-4 border-t border-border pt-4">
                <Label htmlFor="coupon" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Discount code
                </Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="coupon"
                    value={couponCode}
                    placeholder="e.g. WELCOME10"
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError("");
                    }}
                    disabled={Boolean(coupon)}
                  />
                  {coupon ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => { setCoupon(null); setCouponCode(""); }}>
                      Remove
                    </Button>
                  ) : (
                    <Button type="button" variant="secondary" size="sm" onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}>
                      {couponLoading ? <Loader2 className="animate-spin" size={14} /> : "Apply"}
                    </Button>
                  )}
                </div>
                {coupon && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <BadgeCheck size={13} /> {coupon.code} applied — save {formatPrice(coupon.discount)}
                  </p>
                )}
                {couponError && <p className="mt-1.5 text-xs text-destructive">{couponError}</p>}
              </div>

              <dl className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <Truck size={13} /> Delivery ({zone?.name ?? "select area"})
                  </dt>
                  <dd className="font-medium">{zone ? formatPrice(deliveryFee) : "—"}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt>Discount</dt>
                    <dd>-{formatPrice(discount)}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                <span className="text-base font-medium">Total</span>
                <span className="font-serif text-2xl font-semibold">{formatPrice(total)}</span>
              </div>
              {zone?.estimatedDays && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Truck size={12} /> Estimated delivery: {zone.estimatedDays}
                </p>
              )}
            </div>

            <div className="flex items-start gap-2.5 rounded-sm border border-border bg-card p-4 text-xs text-muted-foreground">
              <ShieldCheck size={16} className="shrink-0 text-champagne-deep" />
              <span>
                Your details are used only to fulfil your order. We never share your information, and card details are
                handled entirely by Paystack.
              </span>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}