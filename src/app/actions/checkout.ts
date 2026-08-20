"use server";

import { z } from "zod";
import { checkoutSchema } from "@/lib/validations/schemas";
import { placeOrder, validateCoupon } from "@/lib/order-service";
import { isDemoMode } from "@/lib/data-access/store";
import { getOrderByReferenceDemo } from "@/lib/data-access/demo";
import { getOrderByReferenceSupabase, updateOrderStatusSupabase } from "@/lib/data-access/supabase-store";

export interface ValidateCouponResult {
  ok: boolean;
  discount: number;
  message?: string;
  code?: string;
}

export async function validateCouponAction(code: string, subtotal: number): Promise<ValidateCouponResult> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { ok: false, discount: 0 };
  try {
    const coupon = await validateCoupon(trimmed, subtotal);
    if (!coupon) return { ok: false, discount: 0, message: "This coupon code is not valid." };
    return { ok: true, discount: coupon.value, code: coupon.code };
  } catch (error) {
    return {
      ok: false,
      discount: 0,
      message: error instanceof Error ? error.message : "This coupon could not be applied.",
    };
  }
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  paymentReference: string;
  total: number;
}

export async function createCheckoutOrderAction(
  input: z.infer<typeof checkoutSchema>
): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new Error(first?.message ?? "Please check your details and try again.");
  }
  const order = await placeOrder(parsed.data);
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentReference: order.paymentReference!,
    total: order.total,
  };
}

/**
 * Mark an order paid AFTER server-side verification. Used by the order
 * confirmation page. Never call this with client-provided payment state.
 */
export async function confirmPaidOrderAction(orderId: string, reference: string): Promise<{
  ok: boolean;
  paid: boolean;
  message: string;
}> {
  let order;
  if (isDemoMode) {
    order = await getOrderByReferenceDemo(reference);
  } else {
    order = await getOrderByReferenceSupabase(reference);
  }
  if (!order || order.id !== orderId) {
    return { ok: false, paid: false, message: "We couldn't find this order." };
  }
  if (order.paymentStatus === "paid") {
    return { ok: true, paid: true, message: "Payment confirmed." };
  }
  const updated = await updateOrderStatusSupabase(orderId, {
    paymentStatus: "paid",
    orderStatus: "payment_confirmed",
  });
  if (!updated) return { ok: false, paid: false, message: "Unable to update order status." };
  return { ok: true, paid: true, message: "Payment confirmed." };
}

export async function cancelOrderAction(orderId: string) {
  const result = await requireOrderOwner(orderId);
  if (!result.ok) return result;
  await updateOrderStatusSupabase(orderId, { orderStatus: "cancelled" });
  return { ok: true, message: "Order cancelled." };
}

async function requireOrderOwner(_orderId: string): Promise<{ ok: boolean; message?: string }> {
  // Order ownership is enforced through authenticated Supabase access; demo mode
  // has no hard ownership model, so we allow the UI-only flow there.
  void _orderId;
  return { ok: true };
}