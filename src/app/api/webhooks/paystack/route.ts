import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { getOrderByReferenceSupabase, updateOrderStatusSupabase } from "@/lib/data-access/supabase-store";

export const dynamic = "force-dynamic";

/**
 * Paystack webhook endpoint. Paystack posts `charge.success` events here after
 * a transaction is confirmed on their side.
 *
 * Security:
 *  - Signature is verified (HMAC-SHA512 of the raw request body using the
 *    Paystack secret).
 *  - Only `charge.success` events act on orders.
 *  - The order is looked up by the `reference` we created (never by client data).
 *  - Order status only moves to paid after this server-side verification.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event.event === "charge.success") {
    const reference = String(event.data?.reference ?? "");
    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }
    const order = await getOrderByReferenceSupabase(reference);
    if (!order) {
      // Order not found — reference isn't one of ours. Ignore silently (200)
      // so Paystack stops retrying but we keep the audit log clean.
      return NextResponse.json({ received: true });
    }
    if (order.paymentStatus !== "paid") {
      await updateOrderStatusSupabase(order.id, {
        paymentStatus: "paid",
        orderStatus: "payment_confirmed",
      });
    }
    return NextResponse.json({ received: true });
  }

  // Other events (charge.failed, transfer.*, etc.) are acknowledged but ignored.
  return NextResponse.json({ received: true });
}