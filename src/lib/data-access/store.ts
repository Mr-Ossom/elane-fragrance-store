import { isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  AdminStats,
  Category,
  Coupon,
  DeliveryZone,
  Order,
  Product,
  ProductQuery,
  Review,
} from "@/types";
import {
  assignOrderNumber,
  createOrderDemo,
  deductInventoryDemo,
  getAdminStatsDemo,
  getBrandsDemo,
  getCategoriesDemo,
  getCouponsDemo,
  getDeliveryZonesDemo,
  getOrderByIdDemo,
  getOrderByReferenceDemo,
  getOrdersDemo,
  getProductBySlugDemo,
  getProductReviewsDemo,
  getProductsDemo,
  getRelatedProductsDemo,
  getReviewsDemo,
  updateOrderDemo,
} from "./demo";
import {
  getAdminStatsSupabase,
  getBrandsSupabase,
  getCategoriesSupabase,
  getCouponsSupabase,
  getDeliveryZonesSupabase,
  getOrdersSupabase,
  getProductBySlugSupabase,
  getProductReviewsSupabase,
  getProductsSupabase,
  getRelatedProductsSupabase,
  getReviewsSupabase,
} from "./supabase-store";

export const isDemoMode = !isSupabaseConfigured;

export function getCategories(): Promise<Category[]> {
  return isSupabaseConfigured ? getCategoriesSupabase() : getCategoriesDemo();
}

export function getDeliveryZones(): Promise<DeliveryZone[]> {
  return isSupabaseConfigured ? getDeliveryZonesSupabase() : getDeliveryZonesDemo();
}

export function getProducts(query?: ProductQuery): Promise<Product[]> {
  return isSupabaseConfigured ? getProductsSupabase(query) : getProductsDemo(query);
}

export function getProductBySlug(slug: string): Promise<Product | null> {
  return isSupabaseConfigured ? getProductBySlugSupabase(slug) : getProductBySlugDemo(slug);
}

export function getRelatedProducts(product: Product, limit?: number): Promise<Product[]> {
  return isSupabaseConfigured
    ? getRelatedProductsSupabase(product, limit)
    : getRelatedProductsDemo(product, limit);
}

export function getReviews(): Promise<Review[]> {
  return isSupabaseConfigured ? getReviewsSupabase() : getReviewsDemo();
}

export function getProductReviews(productId: string): Promise<Review[]> {
  return isSupabaseConfigured ? getProductReviewsSupabase(productId) : getProductReviewsDemo(productId);
}

export function getBrands(): Promise<string[]> {
  return isSupabaseConfigured ? getBrandsSupabase() : getBrandsDemo();
}

export function getOrders(): Promise<Order[]> {
  return isSupabaseConfigured ? getOrdersSupabase() : getOrdersDemo();
}

export function getOrdersByUser(userId: string): Promise<Order[]> {
  return import("@/lib/data-access/supabase-store").then((m) => m.getOrdersByUserSupabase(userId));
}

export function getOrderById(orderId: string): Promise<Order | null> {
  if (!isSupabaseConfigured) return getOrderByIdDemo(orderId);
  return import("@/lib/data-access/supabase-store").then((m) => m.getOrderByIdSupabase(orderId));
}

export function getOrderByReference(reference: string): Promise<Order | null> {
  if (!isSupabaseConfigured) return getOrderByReferenceDemo(reference);
  return import("@/lib/data-access/supabase-store").then((m) => m.getOrderByReferenceSupabase(reference));
}

export async function getOrderByNumberAndPhone(orderNumber: string, phone: string): Promise<Order | null> {
  if (isSupabaseConfigured) {
    return import("@/lib/data-access/supabase-store").then((m) =>
      m.getOrderByNumberAndPhoneSupabase(orderNumber, phone)
    );
  }
  const orders = await getOrdersDemo();
  return (
    orders.find(
      (o) => o.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase() && o.customer.phone === phone.trim()
    ) ?? null
  );
}

export function getCoupons(): Promise<Coupon[]> {
  return isSupabaseConfigured ? getCouponsSupabase() : getCouponsDemo();
}

export function getAdminStats(): Promise<AdminStats> {
  return isSupabaseConfigured ? getAdminStatsSupabase() : getAdminStatsDemo();
}

export {
  assignOrderNumber,
  createOrderDemo,
  deductInventoryDemo,
  getOrderByIdDemo,
  updateOrderDemo,
};