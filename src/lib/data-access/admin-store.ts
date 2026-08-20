import { createAdminClient } from "@/lib/supabase/admin";
import type { Coupon, DeliveryZone, Gender, FragranceFamily, Review } from "@/types";

type Row = Record<string, unknown>;

export interface AdminCustomer {
  email: string;
  name: string;
  phone: string;
  orders: number;
  spent: number;
  lastOrderAt: string | null;
}

// ------------------------------------------------------------
// Orders
// ------------------------------------------------------------
export async function getOrdersAdmin() {
  const client = createAdminClient();
  const { data, error } = await client
    .from("orders")
    .select(`*, items:order_items(*)`)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ------------------------------------------------------------
// Customers (derived from the order ledger)
// ------------------------------------------------------------
export async function getCustomersAdmin(): Promise<AdminCustomer[]> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("orders")
    .select("customer_name, customer_email, customer_phone, total, payment_status, created_at")
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error || !data) return [];
  const byEmail = new Map<string, AdminCustomer>();
  for (const o of data as Row[]) {
    const email = String(o.customer_email ?? "").toLowerCase() || "guest";
    const row = byEmail.get(email) ?? {
      email: String(o.customer_email ?? ""),
      name: String(o.customer_name ?? ""),
      phone: String(o.customer_phone ?? ""),
      orders: 0,
      spent: 0,
      lastOrderAt: null,
    };
    row.orders += 1;
    if (o.payment_status === "paid") row.spent += Number(o.total ?? 0);
    if (!row.lastOrderAt || String(o.created_at) > row.lastOrderAt) row.lastOrderAt = String(o.created_at);
    byEmail.set(email, row);
  }
  return Array.from(byEmail.values()).sort((a, b) => b.spent - a.spent);
}

// ------------------------------------------------------------
// Inventory
// ------------------------------------------------------------
export async function getInventoryAdmin() {
  const client = createAdminClient();
  const { data, error } = await client
    .from("products")
    .select("id, name, slug, brand, min_price, variants:product_variants(id, size, price, sale_price, stock)")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateVariantStockAdmin(variantId: string, stock: number): Promise<void> {
  const client = createAdminClient();
  const { error } = await client
    .from("product_variants")
    .update({ stock: Math.max(0, Math.floor(stock)) })
    .eq("id", variantId);
  if (error) throw new Error(error.message);
}

// ------------------------------------------------------------
// Reviews moderation
// ------------------------------------------------------------
export async function getReviewsAdmin(): Promise<Review[]> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("reviews")
    .select(`*, product:products(name)`)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return [];
  return ((data as Row[]) ?? []).map((r) => ({
    id: String(r.id),
    productId: String(r.product_id),
    productName: String((r.product as Row | null)?.["name"] ?? ""),
    customerName: String(r.customer_name),
    rating: Number(r.rating),
    title: (r.title as string | null) ?? null,
    content: String(r.content),
    verified: Boolean(r.verified),
    approved: Boolean(r.approved),
    createdAt: String(r.created_at),
  }));
}

export async function setReviewModerationAdmin(reviewId: string, approved: boolean): Promise<void> {
  const client = createAdminClient();
  const { error } = await client.from("reviews").update({ approved }).eq("id", reviewId);
  if (error) throw new Error(error.message);
}

// ------------------------------------------------------------
// Coupons
// ------------------------------------------------------------
export async function getCouponsAdmin(): Promise<Coupon[]> {
  const client = createAdminClient();
  const { data, error } = await client.from("coupons").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return ((data as Row[]) ?? []).map((c) => ({
    id: String(c.id),
    code: String(c.code),
    type: c.type as "percentage" | "fixed",
    value: Number(c.value),
    minOrder: c.min_order == null ? null : Number(c.min_order),
    maxUses: c.max_uses == null ? null : Number(c.max_uses),
    uses: Number(c.uses ?? 0),
    expiresAt: (c.expires_at as string | null) ?? null,
    active: c.active !== false,
  }));
}

export async function upsertCouponAdmin(input: {
  id?: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder?: number | null;
  maxUses?: number | null;
  active: boolean;
}): Promise<void> {
  const client = createAdminClient();
  const payload: Record<string, unknown> = {
    code: input.code.toUpperCase(),
    type: input.type,
    value: input.value,
    min_order: input.minOrder ?? null,
    max_uses: input.maxUses ?? null,
    active: input.active,
  };
  const { error } = input.id
    ? await client.from("coupons").update(payload).eq("id", input.id)
    : await client.from("coupons").insert(payload);
  if (error) throw new Error(error.message);
}

// ------------------------------------------------------------
// Delivery zones
// ------------------------------------------------------------
export async function getZonesAdmin(): Promise<DeliveryZone[]> {
  const client = createAdminClient();
  const { data, error } = await client.from("delivery_zones").select("*").order("sort_order", { ascending: true });
  if (error) return [];
  return ((data as Row[]) ?? []).map((z) => ({
    id: String(z.id),
    name: String(z.name),
    cities: (z.cities as string[]) ?? [],
    fee: Number(z.fee),
    estimatedDays: String(z.estimated_days),
    active: z.active !== false,
  }));
}

export async function updateZoneAdmin(
  zoneId: string,
  patch: { fee?: number; estimatedDays?: string; active?: boolean }
): Promise<void> {
  const client = createAdminClient();
  const payload: Record<string, unknown> = { updated_at: undefined };
  if (patch.fee != null) payload.fee = patch.fee;
  if (patch.estimatedDays != null) payload.estimated_days = patch.estimatedDays;
  if (patch.active != null) payload.active = patch.active;
  delete payload.updated_at;
  const { error } = await client.from("delivery_zones").update(payload).eq("id", zoneId);
  if (error) throw new Error(error.message);
}

// ------------------------------------------------------------
// Products — full CRUD
// ------------------------------------------------------------
export interface ProductEditorData {
  id: string;
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
  images: { id: string; url: string; alt: string; sortOrder: number }[];
  variants: { id: string; size: string; price: number; salePrice: number | null; stock: number; sku: string }[];
}

export async function getProductsAdminList() {
  const client = createAdminClient();
  const { data, error } = await client
    .from("products")
    .select("id, name, slug, brand, min_price, featured, bestseller, new_arrival, variants:product_variants(stock)")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Row[]) ?? [];
}

export async function getProductEditorAdmin(productId: string): Promise<ProductEditorData | null> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("products")
    .select(
      `*,
      images:product_images(id, url, alt, sort_order),
      variants:product_variants(id, size, price, sale_price, stock, sku)`
    )
    .eq("id", productId)
    .single();
  if (error || !data) return null;
  const row = data as Row;
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    brand: String(row.brand),
    description: String(row.description ?? ""),
    categoryId: String(row.category_id),
    gender: (row.gender as Gender) ?? "unisex",
    fragranceFamily: (row.fragrance_family as FragranceFamily) ?? "Fresh",
    topNotes: (row.top_notes as string[]) ?? [],
    heartNotes: (row.heart_notes as string[]) ?? [],
    baseNotes: (row.base_notes as string[]) ?? [],
    longevity: (row.longevity as string | null) ?? null,
    sillage: (row.sillage as string | null) ?? null,
    occasion: (row.occasion as string | null) ?? null,
    featured: Boolean(row.featured),
    bestseller: Boolean(row.bestseller),
    newArrival: Boolean(row.new_arrival),
    sortOrder: Number(row.sort_order ?? 0),
    images: ((row.images as Row[]) ?? []).map((i) => ({
      id: String(i.id),
      url: String(i.url),
      alt: String(i.alt ?? ""),
      sortOrder: Number(i.sort_order ?? 0),
    })),
    variants: ((row.variants as Row[]) ?? []).map((v) => ({
      id: String(v.id),
      size: String(v.size),
      price: Number(v.price),
      salePrice: v.sale_price == null ? null : Number(v.sale_price),
      stock: Number(v.stock),
      sku: String(v.sku ?? ""),
    })),
  };
}

export async function saveProductAdmin(input: {
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
}): Promise<string> {
  const client = createAdminClient();
  const { data: category } = await client
    .from("product_categories")
    .select("slug, name")
    .eq("id", input.categoryId)
    .single();

  const payload: Record<string, unknown> = {
    name: input.name,
    slug: input.slug,
    brand: input.brand,
    description: input.description,
    category_id: input.categoryId,
    category_slug: (category as Row | null)?.slug ?? null,
    category_name: (category as Row | null)?.name ?? null,
    gender: input.gender,
    fragrance_family: input.fragranceFamily,
    top_notes: input.topNotes,
    heart_notes: input.heartNotes,
    base_notes: input.baseNotes,
    longevity: input.longevity,
    sillage: input.sillage,
    occasion: input.occasion,
    featured: input.featured,
    bestseller: input.bestseller,
    new_arrival: input.newArrival,
    sort_order: input.sortOrder,
    min_price: input.minPrice,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await client
      .from("products")
      .update(payload)
      .eq("id", input.id)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return String((data as Row).id);
  }

  const { data, error } = await client.from("products").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return String((data as Row).id);
}

export async function deleteProductAdmin(productId: string): Promise<void> {
  const client = createAdminClient();
  const { error } = await client.from("products").delete().eq("id", productId);
  if (error) throw new Error(error.message);
}

export async function saveVariantAdmin(input: {
  id?: string;
  productId: string;
  size: string;
  price: number;
  salePrice: number | null;
  stock: number;
  sku: string;
}): Promise<string> {
  const client = createAdminClient();
  const payload: Record<string, unknown> = {
    product_id: input.productId,
    size: input.size,
    price: input.price,
    sale_price: input.salePrice,
    stock: input.stock,
    sku: input.sku,
  };
  if (input.id) {
    const { data, error } = await client
      .from("product_variants")
      .update(payload)
      .eq("id", input.id)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return String((data as Row).id);
  }
  const { data, error } = await client
    .from("product_variants")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return String((data as Row).id);
}

export async function deleteVariantAdmin(variantId: string): Promise<void> {
  const client = createAdminClient();
  const { error } = await client.from("product_variants").delete().eq("id", variantId);
  if (error) throw new Error(error.message);
}

export async function saveProductImageAdmin(input: {
  id?: string;
  productId: string;
  url: string;
  alt: string;
  sortOrder: number;
}): Promise<string> {
  const client = createAdminClient();
  const payload: Record<string, unknown> = {
    product_id: input.productId,
    url: input.url,
    alt: input.alt,
    sort_order: input.sortOrder,
  };
  if (input.id) {
    const { data, error } = await client
      .from("product_images")
      .update(payload)
      .eq("id", input.id)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return String((data as Row).id);
  }
  const { data, error } = await client.from("product_images").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return String((data as Row).id);
}

export async function deleteProductImageAdmin(imageId: string): Promise<void> {
  const client = createAdminClient();
  const { error } = await client.from("product_images").delete().eq("id", imageId);
  if (error) throw new Error(error.message);
}

const IMAGE_BUCKET = "product-images";

export async function uploadProductImageAdmin(fileBuffer: ArrayBuffer, fileName: string): Promise<string> {
  const client = createAdminClient();
  const { data, error } = await client.storage
    .from(IMAGE_BUCKET)
    .upload(`${Date.now()}-${fileName.replace(/[^a-z0-9._-]/gi, "").toLowerCase()}`, fileBuffer, {
      contentType: "image/*",
      upsert: false,
    });
  if (error) throw new Error("Could not upload image: " + error.message);
  const { data: urlData } = client.storage.from(IMAGE_BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}