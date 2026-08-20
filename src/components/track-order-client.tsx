"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, PackageSearch, Truck } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/format";
import { orderStatusLabel, activeStageIndex, ORDER_FLOW } from "@/lib/order-status";
import { whatsappLink, brand } from "@/lib/brand";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TrackedOrder {
  orderNumber: string;
  orderStatus: string;
  items: { productName: string; size: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  createdAt: string;
  customer: { city: string; region: string; phone: string };
}

export function TrackOrderClient() {
  const [number, setNumber] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [order, setOrder] = React.useState<TrackedOrder | null>(null);
  const [notFound, setNotFound] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);
    setOrder(null);
    try {
      const res = await fetch(
        `/api/orders/lookup?number=${encodeURIComponent(number)}&phone=${encodeURIComponent(phone)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  const stageIndex = activeStageIndex(order?.orderStatus as never);
  const stages = order?.orderStatus === "cancelled" ? [] : ORDER_FLOW;

  return (
    <div className="container-site max-w-3xl py-14">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-champagne-deep">Order support</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Track your delivery</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Enter the order number from your confirmation (e.g. GN-2026-4821) and the phone number you ordered with.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-md space-y-4 rounded-sm border border-border bg-card p-6">
        <div>
          <Label htmlFor="t-number">Order number</Label>
          <Input id="t-number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="GN-2026-1234" required />
        </div>
        <div>
          <Label htmlFor="t-phone">Phone number</Label>
          <Input id="t-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="024 000 0000" required />
        </div>
        {notFound && (
          <p className="rounded-sm border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            We couldn&apos;t find that order. Double-check the details or{" "}
            <a href={whatsappLink("Hi, I need help tracking my order")} className="underline" target="_blank" rel="noreferrer">
              message us on WhatsApp
            </a>
            .
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full gap-2" size="lg">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <PackageSearch size={16} />} Track Order
        </Button>
      </form>

      {order && stageIndex >= 0 && (
        <div className="mt-10 rounded-sm border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-serif text-2xl font-semibold">{order.orderNumber}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Placed {formatDate(order.createdAt)}</p>
            </div>
            <span className="inline-flex rounded-sm bg-primary px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-primary-foreground">
              {orderStatusLabel(order.orderStatus as never)}
            </span>
          </div>

          <ol className="mt-8">
            {stages.map((stage, i) => {
              const reached = i <= stageIndex;
              return (
                <li key={stage.key} className="relative flex gap-4 pb-7 last:pb-0">
                  {i < stages.length - 1 && (
                    <span className={cn("absolute left-[15px] top-8 h-[calc(100%-32px)] w-px", reached && i < stageIndex ? "bg-champagne-deep" : "bg-border")} />
                  )}
                  <span
                    className={cn(
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs",
                      reached ? "border-champagne-deep bg-champagne-deep text-white" : "border-border bg-background text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className={cn("pt-1", !reached && "opacity-50")}>
                    <p className="font-medium">{stage.label}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{stage.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Items</h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span>
                      {item.productName} ({item.size}) × {item.quantity}
                    </span>
                    <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </li>
                ))}
                <li className="flex justify-between border-t border-border pt-2 text-sm text-muted-foreground">
                  <span>Delivery to {order.customer.city}, {order.customer.region}</span>
                  <span>{formatPrice(order.deliveryFee)}</span>
                </li>
                {order.discount > 0 && (
                  <li className="flex justify-between text-emerald-700">
                    <span>Coupon savings</span>
                    <span>−{formatPrice(order.discount)}</span>
                  </li>
                )}
                <li className="flex justify-between border-t border-border pt-2 font-medium">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </li>
              </ul>
            </div>
            <div className="sm:text-right">
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Questions?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We can help re-route, reschedule or answer anything about your order.
              </p>
              <a
                href={whatsappLink(`Hi, I'd like help with order ${order.orderNumber}`)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-sm bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
              >
                <Truck size={15} /> WhatsApp {brand.name}
              </a>
            </div>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Signed in?{" "}
        <Link href="/account" className="text-champagne-deep underline-offset-2 hover:underline">
          View your orders in your account
        </Link>
      </p>
    </div>
  );
}