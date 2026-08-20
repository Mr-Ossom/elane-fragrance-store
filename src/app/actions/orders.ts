"use server";

import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/data-access/store";
import { CANCELABLE_STATUSES } from "@/lib/order-service";
import { getOrderByIdDemo, updateOrderDemo } from "@/lib/data-access/demo";
import { getOrderByIdSupabase, updateOrderStatusSupabase } from "@/lib/data-access/supabase-store";

export async function cancelOrderAction(orderId: string) {
  try {
    const order = isDemoMode
      ? await getOrderByIdDemo(orderId)
      : await getOrderByIdSupabase(orderId);
    if (!order) return { ok: false, error: "Order not found." };

    if (order.orderStatus === "cancelled") return { ok: false, error: "This order is already cancelled." };
    if (!CANCELABLE_STATUSES.has(order.orderStatus)) {
      return {
        ok: false,
        error: "This order can no longer be cancelled — it's already in transit or delivered.",
      };
    }
    const paid = (order.paymentStatus ?? "") === "paid";
    if (paid) {
      return {
        ok: false,
        error: "This order is already paid and in fulfilment. Please contact us to request a refund.",
      };
    }

    if (isDemoMode) {
      await updateOrderDemo(orderId, {
        orderStatus: "cancelled",
        updatedAt: new Date().toISOString(),
      });
    } else {
      await updateOrderStatusSupabase(orderId, { orderStatus: "cancelled", paymentStatus: "cancelled" });
    }

    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath("/account");
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: "Something went wrong while cancelling your order. Please try again." };
  }
}