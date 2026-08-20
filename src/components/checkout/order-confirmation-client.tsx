"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock3, Loader2, MessageCircle, XCircle } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/format";
import { whatsappLink } from "@/lib/brand";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { OrderTimeline } from "@/components/order-timeline";
import type { Order } from "@/types";

type Status = "verifying" | "paid" | "unpaid" | "error" | "missing";

export function OrderConfirmationClient({ reference }: { reference: string }) {
  const [status, setStatus] = React.useState<Status>(reference ? "verifying" : "missing");
  const [order, setOrder] = React.useState<Order | null>(null);
  const [message, setMessage] = React.useState("");

  const verify = React.useCallback(async (showVerifying = true) => {
    if (!reference) {
      setStatus("missing");
      return;
    }
    if (showVerifying) setStatus("verifying");
    try {
      const res = await fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok && !data) {
        // Non-JSON failure
        const text = await res.text().catch(() => "");
        void text;
        throw new Error("Unable to reach payment verification.");
      }
      if (!data.ok) {
        setMessage(data.message ?? "Payment could not be verified.");
        if (data.paid === false) setStatus("unpaid");
        else setStatus("error");
        return;
      }
      const orderRes = await fetch(`/api/orders/lookup?reference=${encodeURIComponent(reference)}`, {
        cache: "no-store",
      });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        if (orderData.order) setOrder(orderData.order);
      }
      if (data.paid) {
        setStatus("paid");
        track("purchase_completed", { reference });
        if (data.channel) setMessage(`Paid via ${data.channel}`);
      } else {
        setStatus("unpaid");
        setMessage(data.message ?? "Payment not completed.");
      }
    } catch {
      setStatus("error");
      setMessage("We couldn't confirm your payment right now. Please check back shortly or contact support on WhatsApp.");
    }
  }, [reference]);

  React.useEffect(() => {
    // Mount-only verification of the payment reference.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    verify();
  }, [verify]);

  if (status === "verifying") {
    return (
      <div className="container-site flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <Loader2 className="animate-spin text-champagne-deep" size={36} strokeWidth={1.5} />
        <h1 className="text-2xl">Verifying your payment…</h1>
        <p className="text-sm text-muted-foreground">This takes a few seconds.</p>
      </div>
    );
  }

  if (status === "missing" || status === "error") {
    return (
      <div className="container-site py-16">
        <ConfirmationCard
          icon={<XCircle size={38} className="text-destructive" />}
          title={status === "missing" ? "No payment reference found" : "We hit a snag"}
          message={
            message ||
            "Please check the link you opened, or contact our team on WhatsApp for help with your order."
          }
          actions={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline">
                <Link href="/shop">Continue Shopping</Link>
              </Button>
              <Button asChild variant="outline" className="text-[#128C7E]">
                <a href={whatsappLink("Hello ÉLANÉ! I need help confirming my payment.")} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={16} /> WhatsApp Support
                </a>
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (status === "paid" && order) {
    return (
      <div className="container-site py-10 sm:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <CheckCircle2 size={44} className="mx-auto text-emerald-600" strokeWidth={1.25} />
          <h1 className="mt-4 text-4xl sm:text-5xl">Thank you — your order has been confirmed!</h1>
          <p className="mt-3 text-muted-foreground">
            Order <span className="font-medium text-foreground">{order.orderNumber}</span> ·{" "}
            {formatDate(order.createdAt)}
            {message && <span className="block text-sm">{message}</span>}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-sm border border-border bg-card p-6">
          <OrderTimeline status={order.orderStatus} />
        </div>

        <div className="mx-auto mt-8 max-w-2xl rounded-sm border border-border bg-card p-6">
          <h2 className="font-serif text-xl font-semibold">Your order</h2>
          <ul className="mt-4 divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3">
                <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-sm bg-secondary">
                  <Image src={item.image ?? "/images/products/hero.svg"} alt={item.productName} fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{item.size} × {item.quantity}</p>
                </div>
                <span className="text-sm font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
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
                <dt>Discount</dt>
                <dd>-{formatPrice(order.discount)}</dd>
              </div>
            )}
          </dl>
          <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
            <span className="font-medium">Total paid</span>
            <span className="font-serif text-2xl font-semibold">{formatPrice(order.total)}</span>
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-sm border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
            <Clock3 size={14} className="mt-0.5 shrink-0" />
            We&apos;ve received your order. You&apos;ll be contacted on{" "}
            <span className="font-medium text-foreground">{order.customer.phone}</span> to confirm delivery to{" "}
            {order.customer.city}, {order.customer.region}.
          </p>
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button asChild variant="outline" className="text-[#128C7E]">
            <a
              href={whatsappLink(`Hello ÉLANÉ! I just paid for order ${order.orderNumber}. Please confirm my delivery.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={16} /> Confirm via WhatsApp
            </a>
          </Button>
        </div>
      </div>
    );
  }

  if (status === "paid" && !order) {
    return (
      <div className="container-site py-16">
        <ConfirmationCard
          icon={<CheckCircle2 size={38} className="text-emerald-600" />}
          title="Payment received!"
          message="We're confirming your order details. If this takes longer than a minute, contact us on WhatsApp."
          actions={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild><Link href="/shop">Continue Shopping</Link></Button>
              <Button asChild variant="outline" className="text-[#128C7E]">
                <a href={whatsappLink("Hello ÉLANÉ! I need help with my order confirmation.")} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={16} /> WhatsApp Support
                </a>
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  // unpaid / payment pending / failed
  return (
    <div className="container-site py-16">
      <ConfirmationCard
        icon={<Clock3 size={38} className="text-amber-600" />}
        title="Your payment wasn’t completed"
        message={
          message ||
          "You can retry your payment, or contact our team on WhatsApp and we'll help you complete your order."
        }
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {order?.paymentReference && (
              <Button onClick={() => verify()} variant="accent">
                Retry verification
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/cart">Return to Bag</Link>
            </Button>
            <Button asChild variant="outline" className="text-[#128C7E]">
              <a href={whatsappLink("Hello ÉLANÉ! I had trouble completing my payment.")} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} /> WhatsApp Support
              </a>
            </Button>
          </div>
        }
      />
    </div>
  );
}

function ConfirmationCard({
  icon,
  title,
  message,
  actions,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  actions: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-sm border border-border bg-card p-8 text-center">
      <div className="flex justify-center">{icon}</div>
      <h1 className="mt-4 text-3xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{message}</p>
      <div className="mt-6">{actions}</div>
    </div>
  );
}