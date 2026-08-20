import type { OrderStatus } from "@/types";

export interface OrderStage {
  key: OrderStatus;
  label: string;
  description: string;
}

export const ORDER_FLOW: OrderStage[] = [
  { key: "pending", label: "Order placed", description: "We've received your order and confirmation." },
  { key: "payment_confirmed", label: "Payment confirmed", description: "Your payment has been verified securely." },
  { key: "processing", label: "Processing", description: "Your fragrance is being prepared and packed." },
  { key: "ready_for_delivery", label: "Ready for delivery", description: "Your parcel is with our dispatch team." },
  { key: "out_for_delivery", label: "Out for delivery", description: "Your parcel is on its way to you." },
  { key: "delivered", label: "Delivered", description: "Enjoy your new signature scent." },
];

export const CANCELED_STAGE: OrderStage = {
  key: "cancelled",
  label: "Cancelled",
  description: "This order has been cancelled.",
};

export function orderStatusLabel(status: OrderStatus): string {
  if (status === "cancelled") return CANCELED_STAGE.label;
  return ORDER_FLOW.find((s) => s.key === status)?.label ?? status.replace(/_/g, " ");
}

export function activeStageIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1;
  return ORDER_FLOW.findIndex((s) => s.key === status);
}