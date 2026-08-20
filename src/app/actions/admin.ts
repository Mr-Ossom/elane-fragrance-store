"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  deleteProductAdmin,
  deleteProductImageAdmin,
  deleteVariantAdmin,
  saveProductAdmin,
  saveProductImageAdmin,
  saveVariantAdmin,
  setReviewModerationAdmin,
  updateVariantStockAdmin,
  upsertCouponAdmin,
  updateZoneAdmin,
  uploadProductImageAdmin,
} from "@/lib/data-access/admin-store";
import { updateOrderStatusSupabase } from "@/lib/data-access/supabase-store";
import { ORDER_STATUSES } from "@/lib/order-status";
import type { Gender, FragranceFamily, Order } from "@/types";


export async function adminUpdateOrderStatus(orderId: string, orderStatus: Order["orderStatus"]) {
  if (!ORDER_STATUSES.includes(orderStatus)) return { ok: false, error: "Invalid status" };
  try {
    const paymentStatus: Order["paymentStatus"] =
      orderStatus === "cancelled" ? "cancelled" : orderStatus === "payment_confirmed" ? "paid" : "paid";
    await updateOrderStatusSupabase(orderId, { orderStatus, paymentStatus });
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: (e as Error).message ?? "Failed to update order" };
  }
}

const stockSchema = z.object({
  variantId: z.string(),
  stock: z.number().int().min(0).max(100000),
});

export async function adminUpdateStock(input: z.infer<typeof stockSchema>) {
  const parsed = stockSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid stock value" };
  try {
    await updateVariantStockAdmin(parsed.data.variantId, parsed.data.stock);
    revalidatePath("/admin");
    revalidatePath("/admin/inventory");
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: (e as Error).message ?? "Failed to update stock" };
  }
}

export async function adminModerateReview(reviewId: string, approved: boolean) {
  try {
    await setReviewModerationAdmin(reviewId, approved);
    revalidatePath("/admin/reviews");
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: (e as Error).message ?? "Failed to update review" };
  }
}

const couponSchema = z.object({
  id: z.string().optional(),
  code: z.string().trim().min(2).max(30),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive(),
  minOrder: z.number().nonnegative().nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  active: z.boolean(),
});

export async function adminSaveCoupon(input: z.infer<typeof couponSchema>) {
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid coupon" };
  if (parsed.data.type === "percentage" && parsed.data.value > 100) {
    return { ok: false, error: "Percentage coupons cannot exceed 100%" };
  }
  try {
    await upsertCouponAdmin(parsed.data);
    revalidatePath("/admin/coupons");
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: (e as Error).message ?? "Failed to save coupon" };
  }
}

const zoneSchema = z.object({
  zoneId: z.string(),
  fee: z.number().nonnegative(),
  estimatedDays: z.string().max(60),
  active: z.boolean(),
});

export async function adminUpdateZone(input: z.infer<typeof zoneSchema>) {
  const parsed = zoneSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid delivery zone" };
  try {
    await updateZoneAdmin(parsed.data.zoneId, {
      fee: parsed.data.fee,
      estimatedDays: parsed.data.estimatedDays,
      active: parsed.data.active,
    });
    revalidatePath("/admin/delivery");
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: (e as Error).message ?? "Failed to update zone" };
  }
}

// ------------------------------------------------------------
// Products
// ------------------------------------------------------------
export async function adminSaveProduct(input: {
  id?: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  categoryId: string;
  gender: Gender;
  fragranceFamily: FragranceFamily;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  longevity: string | null;
  sillage: string | null;
  occasion: string | null;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  sortOrder: number;
  minPrice: number;
}) {
  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!name || name.length < 2) return { ok: false, error: "Product name is required (min 2 characters)." };
  if (!slug) return { ok: false, error: "A URL slug is required." };
  if (!input.categoryId) return { ok: false, error: "Select a category." };
  if (input.fragranceFamily && !["Fresh", "Woody", "Sweet", "Floral", "Oud", "Citrus", "Musky", "Oriental"].includes(input.fragranceFamily)) {
    return { ok: false, error: "Invalid fragrance family." };
  }
  try {
    const id = await saveProductAdmin({
      ...input,
      name,
      slug,
      topNotes: input.topNotes.map((n) => n.trim()).filter(Boolean),
      heartNotes: input.heartNotes.map((n) => n.trim()).filter(Boolean),
      baseNotes: input.baseNotes.map((n) => n.trim()).filter(Boolean),
      longevity: input.longevity?.trim() || null,
      sillage: input.sillage?.trim() || null,
      occasion: input.occasion?.trim() || null,
      minPrice: Math.max(0, input.minPrice),
      sortOrder: Math.floor(input.sortOrder),
    });
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: (e as Error).message ?? "Failed to save product" };
  }
}

export async function adminDeleteProduct(productId: string) {
  try {
    await deleteProductAdmin(productId);
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: (e as Error).message ?? "Failed to delete product" };
  }
}

const variantSchema = z.object({
  id: z.string().optional(),
  productId: z.string(),
  size: z.string().trim().min(1).max(40),
  price: z.number().positive().max(1000000),
  salePrice: z.number().nonnegative().max(1000000).nullable().optional(),
  stock: z.number().int().min(0).max(1000000),
  sku: z.string().trim().max(40),
});

export async function adminSaveVariant(input: z.infer<typeof variantSchema>) {
  const parsed = variantSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid variant" };
  try {
    const salePrice = parsed.data.salePrice != null && parsed.data.salePrice > 0 ? parsed.data.salePrice : null;
    await saveVariantAdmin({ ...parsed.data, salePrice });
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: (e as Error).message ?? "Failed to save variant" };
  }
}

export async function adminDeleteVariant(variantId: string) {
  try {
    await deleteVariantAdmin(variantId);
    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: (e as Error).message ?? "Failed to delete variant" };
  }
}

export async function adminUploadProductImage(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string | null }> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided" };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: "Image must be under 5MB" };
  try {
    const buffer = await file.arrayBuffer();
    const url = await uploadProductImageAdmin(buffer, file.name);
    return { ok: true, url, error: null };
  } catch (e) {
    return { ok: false, error: (e as Error).message ?? "Upload failed" };
  }
}

export async function adminSaveProductImage(input: {
  id?: string;
  productId: string;
  url: string;
  alt: string;
  sortOrder: number;
}) {
  const url = input.url.trim();
  if (!url || !/^https?:\/\//i.test(url) && !url.startsWith("/")) {
    return { ok: false, error: "Enter a valid image URL (https:// or /path)." };
  }
  try {
    await saveProductImageAdmin({
      id: input.id,
      productId: input.productId,
      url,
      alt: input.alt.trim(),
      sortOrder: Math.floor(input.sortOrder),
    });
    revalidatePath("/admin/products");
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: (e as Error).message ?? "Failed to save image" };
  }
}

export async function adminDeleteProductImage(imageId: string) {
  try {
    await deleteProductImageAdmin(imageId);
    revalidatePath("/admin/products");
    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: (e as Error).message ?? "Failed to delete image" };
  }
}