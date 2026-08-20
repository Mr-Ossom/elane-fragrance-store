import { randomUUID } from "node:crypto";
import type { CheckoutInput } from "@/lib/validations/schemas";
import type { Coupon, CouponSummary, DeliveryZone, Order, OrderItem, Product } from "@/types";
import { getDeliveryZones, isDemoMode } from "@/lib/data-access/store";
import {
  assignOrderNumber,
  createOrderDemo,
  deductInventoryDemo,
  getProductBySlugDemo,
} from "@/lib/data-access/demo";
import { getProductBySlugSupabase, persistOrderSupabase } from "@/lib/data-access/supabase-store";

export interface CheckoutLinePrice {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  coupon: CouponSummary | null;
}

export async function getDeliveryFee(zones: DeliveryZone[], zoneId: string): Promise<number> {
  const zone = zones.find((z) => z.id === zoneId);
  if (!zone) throw new Error("Please select a valid delivery area");
  return zone.fee;
}

export async function validateCoupon(
  code: string | undefined,
  subtotal: number
): Promise<CouponSummary | null> {
  if (!code) return null;
  const coupon = await findCouponByCode(code);
  if (!coupon || !coupon.active) throw new Error("This coupon code is not valid.");
  const now = new Date();
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    throw new Error("This coupon has expired.");
  }
  if (coupon.maxUses != null && coupon.uses >= coupon.maxUses) {
    throw new Error("This coupon has reached its usage limit.");
  }
  if (coupon.minOrder != null && subtotal < coupon.minOrder) {
    throw new Error(`This coupon requires a minimum order of GH₵${coupon.minOrder.toFixed(0)}.`);
  }
  if (coupon.type === "percentage") {
    const discount = Math.round(subtotal * (coupon.value / 100) * 100) / 100;
    return { code: coupon.code, type: "percentage", value: discount };
  }
  return { code: coupon.code, type: "fixed", value: Math.min(coupon.value, subtotal) };
}

export async function findCouponByCode(code: string): Promise<Coupon | null> {
  const normalized = code.trim().toUpperCase();
  const coupon = await getCouponsForValidation();
  return coupon.find((c) => c.code.toUpperCase() === normalized) ?? null;
}

async function getCouponsForValidation(): Promise<Coupon[]> {
  if (!isDemoMode) {
    const { getCouponsSupabase } = await import("@/lib/data-access/supabase-store");
    return getCouponsSupabase();
  }
  const { getCouponsDemo } = await import("@/lib/data-access/demo");
  return getCouponsDemo();
}

export async function computeOrderPricing(
  items: CheckoutInput["items"],
  deliveryZoneId: string,
  couponCode?: string
): Promise<{ pricing: CheckoutLinePrice; zone: DeliveryZone | null }> {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const zones = await getDeliveryZones();
  const zone = zones.find((z) => z.id === deliveryZoneId) ?? null;
  if (!zone) throw new Error("Please select a valid delivery area");
  const deliveryFee = zone.fee;
  const coupon = await validateCoupon(couponCode, subtotal);
  const discount = coupon?.value ?? 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);
  return { pricing: { subtotal, deliveryFee, discount, total, coupon }, zone };
}

async function loadProduct(productId: string, slug: string): Promise<Product | null> {
  return isDemoMode
    ? getProductBySlugDemo(slug)
    : getProductBySlugSupabase(slug);
}

export async function placeOrder(input: CheckoutInput): Promise<Order> {
  const { pricing, zone } = await computeOrderPricing(input.items, input.deliveryZoneId, input.couponCode);
  if (!zone) throw new Error("Please select a valid delivery area");

  const orderId = randomUUID();
  const orderNumber = isDemoMode ? assignOrderNumber() : generateOrderNumber();
  const paymentReference = `ELANE-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const rawItems: OrderItem[] = [];
  for (const item of input.items) {
    const product = await loadProduct(item.productId, item.slug);
    if (!product) throw new Error(`One of your items is no longer available. Please refresh your bag.`);
    const variant = product.variants.find((v) => v.id === item.variantId);
    if (!variant) throw new Error(`${product.name} is no longer available in the selected size.`);
    if (variant.stock < item.quantity) {
      throw new Error(
        `Only ${variant.stock} left of ${product.name} (${variant.size}). Please adjust your quantity.`
      );
    }
    rawItems.push({
      id: randomUUID(),
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      brand: product.brand,
      variantId: variant.id,
      size: variant.size,
      image: product.images[0]?.url ?? null,
      unitPrice: variant.salePrice ?? variant.price,
      quantity: item.quantity,
    });
    // Guard: never charge more than the live price
    if (Math.abs(item.unitPrice - (variant.salePrice ?? variant.price)) > 0.001) {
      const expected = (variant.salePrice ?? variant.price) * item.quantity;
      const claimed = item.unitPrice * item.quantity;
      if (expected < claimed) {
        throw new Error("Product prices have changed. Please review your bag and try again.");
      }
    }
  }

  const order: Order = {
    id: orderId,
    orderNumber,
    userId: null,
    customer: {
      name: input.customer.name,
      phone: input.customer.phone,
      email: input.customer.email,
      region: input.customer.region,
      city: input.customer.city,
      address: input.customer.address,
      note: input.customer.note || null,
    },
    items: rawItems,
    subtotal: pricing.subtotal,
    deliveryFee: pricing.deliveryFee,
    discount: pricing.discount,
    total: pricing.total,
    coupon: pricing.coupon,
    paymentStatus: "pending",
    orderStatus: "pending",
    paymentReference,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isDemoMode) {
    await deductInventoryDemo(rawItems.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));
    return createOrderDemo(order);
  }

  return persistOrderSupabase({ order, rawItems });
}

export function generateOrderNumber(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `GN-${yyyy}-${seq}`;
}

export const CANCELABLE_STATUSES = new Set<Order["orderStatus"]>(["pending", "payment_confirmed", "processing"]);