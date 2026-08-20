import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrderById } from "@/lib/data-access/store";
import { isPaystackConfigured, initializePaystack } from "@/lib/paystack";
import { siteUrl } from "@/lib/brand";

const bodySchema = z.object({
  orderId: z.string().min(1),
  email: z.string().email().max(200),
  callbackUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const order = await getOrderById(parsed.data.orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ error: "This order has already been paid for" }, { status: 409 });
  }
  if (parsed.data.email.toLowerCase() !== order.customer.email.toLowerCase()) {
    return NextResponse.json({ error: "Email does not match this order" }, { status: 403 });
  }

  const reference = order.paymentReference!;
  const callbackUrl = parsed.data.callbackUrl ?? `${siteUrl}/order-confirmation`;

  // Development mode: no Paystack keys configured — produce a local callback
  // URL so the order flow can be demonstrated end-to-end. When keys are added,
  // real Paystack initialization takes over.
  if (!isPaystackConfigured) {
    return NextResponse.json({
      mode: "dev",
      authorizationUrl: `${siteUrl}/order-confirmation?reference=${reference}`,
      reference,
    });
  }

  try {
    const result = await initializePaystack({
      email: order.customer.email,
      amountGhs: order.total,
      reference,
      callbackUrl,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
    });
    return NextResponse.json({ mode: "live", ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment could not be initialized";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}