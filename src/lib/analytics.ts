"use client";

export type AnalyticsEvent =
  | "product_viewed"
  | "product_added_to_cart"
  | "checkout_started"
  | "payment_initiated"
  | "purchase_completed"
  | "wishlist_added"
  | "search_performed";

export function track(event: AnalyticsEvent, data?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("elane-analytics", { detail: { event, data: data ?? {} } })
    );
  } catch {
    // analytics must never break the storefront
  }
}