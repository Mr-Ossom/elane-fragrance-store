"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Loader2, X } from "lucide-react";
import type { Order } from "@/types";
import { formatPrice, formatDateTime } from "@/lib/format";
import { cancelOrderAction } from "@/app/actions/orders";
import { orderStatusLabel, activeStageIndex, ORDER_FLOW, CANCELED_STAGE } from "@/lib/order-status";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrderDetailClientProps {
  order: Order;
}

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const [cancelling, setCancelling] = React.useState(false);
  const [error, setError] = React.useState("");

  const canCancel = ["pending", "payment_confirmed", "processing"].includes(order.orderStatus);

  async function handleCancel() {
    if (!confirm("Cancel this order?")) return;
    setCancelling(true);
    setError("");
    const result = await cancelOrderAction(order.id);
    setCancelling(false);
    if (!result.ok) setError(result.error ?? "Could not cancel this order. Please try again.");
  }

  const stageIndex = activeStageIndex(order.orderStatus);
  const stages = order.orderStatus === "cancelled" ? [CANCELED_STAGE] : ORDER_FLOW;

  return (
    <div className="container-site max-w-4xl py-8">
      <Link href="/account/orders" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {formatDateTime(order.createdAt)} · {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
          </p>
        </div>
        <Badge variant={order.orderStatus === "cancelled" ? "destructive" : order.orderStatus === "delivered" ? "success" : "default"}>
          {orderStatusLabel(order.orderStatus)}
        </Badge>
      </div>

      {/* Timeline */}
      {order.orderStatus === "cancelled" ? (
        <div className="mt-8 flex items-center gap-3 rounded-sm border border-destructive/30 bg-destructive/5 p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
            <X size={16} />
          </div>
          <p className="text-sm">{CANCELED_STAGE.description}</p>
        </div>
      ) : (
        <ol className="mt-8 space-y-0">
          {stages.map((stage, i) => {
            const reached = i <= stageIndex;
            return (
              <li key={stage.key} className="relative flex gap-4 pb-8 last:pb-0">
                {i < stages.length - 1 && (
                  <span
                    className={cn(
                      "absolute left-[15px] top-8 h-[calc(100%-32px)] w-px",
                      reached && i < stageIndex ? "bg-champagne-deep" : "bg-border"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs",
                    reached
                      ? "border-champagne-deep bg-champagne-deep text-white"
                      : "border-border bg-background text-muted-foreground"
                  )}
                >
                  {reached && i < stageIndex ? <Check size={14} /> : i + 1}
                </span>
                <div className={cn("pt-1", !reached && "opacity-50")}>
                  <p className="font-medium">{stage.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{stage.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div>
          <h2 className="text-2xl">Items</h2>
          <ul className="mt-4 divide-y divide-border rounded-sm border border-border bg-card">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 p-4">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.productName} className="h-16 w-16 rounded-sm object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-secondary text-xs text-muted-foreground">
                    No image
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${item.productSlug}`} className="font-medium hover:text-champagne-deep">
                    {item.productName}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {item.size} · {item.brand}
                  </p>
                  <p className="text-sm text-muted-foreground">Qty {item.quantity} · {formatPrice(item.unitPrice)}</p>
                </div>
                <p className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <aside>
          <h2 className="text-2xl">Summary</h2>
          <dl className="mt-4 space-y-2 rounded-sm border border-border bg-card p-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{formatPrice(order.deliveryFee)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>Coupon savings</dt>
                <dd>−{formatPrice(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>

          <h2 className="mt-8 text-2xl">Delivery details</h2>
          <dl className="mt-3 space-y-1.5 rounded-sm border border-border bg-card p-5 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{order.customer.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{order.customer.phone}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Address</dt>
              <dd>
                {order.customer.address}, {order.customer.city}, {order.customer.region}
              </dd>
            </div>
            {order.customer.note && (
              <div>
                <dt className="text-muted-foreground">Note</dt>
                <dd>{order.customer.note}</dd>
              </div>
            )}
          </dl>

          {canCancel && (
            <div className="mt-6">
              {error && (
                <p className="mb-2 rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button
                variant="outline"
                className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? <Loader2 size={15} className="animate-spin" /> : "Cancel Order"}
              </Button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}