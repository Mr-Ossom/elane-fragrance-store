import { NextResponse } from "next/server";
import { verifyPaystackTransaction, isPaystackConfigured } from "@/lib/paystack";
import { getOrderByReference } from "@/lib/data-access/store";
import { updateOrderStatusSupabase } from "@/lib/data-access/supabase-store";
import { updateOrderDemo } from "@/lib/data-access/demo";
import { isDemoMode } from "@/lib/data-access/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ ok: false, paid: false, message: "Missing payment reference" });
  }

  const order = await getOrderByReference(reference);
  if (!order) {
    return NextResponse.json({ ok: false, paid: false, message: "Order not found for this payment" });
  }
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ ok: true, paid: true, message: "Payment confirmed" });
  }

  // In demo mode there is no gateway to query, so a matching local reference
  // represents a completed development checkout. Real (live) mode verifies
  // server-side with Paystack before any status change.
  if (!isPaystackConfigured && isDemoMode) {
    const updated = await updateOrderDemo(order.id, {
      paymentStatus: "paid",
      orderStatus: "payment_confirmed",
    });
    const ok = updated?.paymentStatus === "paid";
    return NextResponse.json({ ok, paid: ok, message: ok ? "Payment confirmed (dev)" : "Unable to update order" });
  }

  try {
    const result = await verifyPaystackTransaction(reference);
    if (result.paid) {
      const updated = await updateOrderStatusSupabase(order.id, {
        paymentStatus: "paid",
        orderStatus: "payment_confirmed",
      });
      if (!updated) {
        return NextResponse.json({ ok: false, paid: false, message: "Unable to update order status" });
      }
    }
    return NextResponse.json({
      ok: result.paid,
      paid: result.paid,
      message: result.paid
        ? "Payment confirmed"
        : `Payment not completed (${result.status}). Please try again or contact support.`,
      channel: result.channel,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment verification failed";
    return NextResponse.json({ ok: false, paid: false, message });
  }
}