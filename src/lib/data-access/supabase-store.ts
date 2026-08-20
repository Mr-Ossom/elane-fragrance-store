import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
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

type Row = Record<string, unknown>;

function mapProduct(row: Row, images: Row[], variants: Row[]): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    brand: String(row.brand),
    description: String(row.description ?? ""),
    categoryId: String(row.category_id),
    categorySlug: String(row.category_slug),
    categoryName: String(row.category_name ?? ""),
    gender: (row.gender as Product["gender"]) ?? "unisex",
    fragranceFamily: (row.fragrance_family as Product["fragranceFamily"]) ?? "Fresh",
    topNotes: (row.top_notes as string[] | null) ?? [],
    heartNotes: (row.heart_notes as string[] | null) ?? [],
    baseNotes: (row.base_notes as string[] | null) ?? [],
    longevity: (row.longevity as string | null) ?? null,
    sillage: (row.sillage as string | null) ?? null,
    occasion: (row.occasion as string | null) ?? null,
    featured: Boolean(row.featured),
    bestseller: Boolean(row.bestseller),
    newArrival: Boolean(row.new_arrival),
    isDemo: false,
    images: images
      .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
      .map((img) => ({
        id: String(img.id),
        url: String(img.url),
        alt: String(img.alt ?? ""),
        sortOrder: Number(img.sort_order ?? 0),
      })),
    variants: variants.map((v) => ({
      id: String(v.id),
      productId: String(row.id),
      size: String(v.size),
      price: Number(v.price),
      salePrice: v.sale_price == null ? null : Number(v.sale_price),
      stock: Number(v.stock),
      sku: String(v.sku ?? ""),
    })),
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

async function fetchProducts(query: ProductQuery, admin = false): Promise<Product[]> {
  const client = admin ? createAdminClient() : await createServerClient();
  let q = client
    .from("products")
    .select(
      `*,
      category:product_categories(name),
      images:product_images(id, url, alt, sort_order),
      variants:product_variants(id, size, price, sale_price, stock, sku)`
    )
    .order("featured", { ascending: false })
    .order("bestseller", { ascending: false });

  if (query.category) {
    const cats = Array.isArray(query.category) ? query.category : [query.category];
    q = q.in("category_slug", cats);
  }
  if (query.gender) {
    const genders = Array.isArray(query.gender) ? query.gender : [query.gender];
    q = q.in("gender", genders);
  }
  if (query.family) {
    const families = Array.isArray(query.family) ? query.family : [query.family];
    q = q.in("fragrance_family", families);
  }
  if (query.brand) {
    const brands = Array.isArray(query.brand) ? query.brand : [query.brand];
    q = q.in("brand", brands);
  }
  if (query.rating != null) q = q.gte("rating", query.rating);
  if (query.bestseller) q = q.eq("bestseller", true);
  if (query.newArrival) q = q.eq("new_arrival", true);
  if (query.featured) q = q.eq("featured", true);

  if (query.search) {
    q = q.or(
      `name.ilike.%${query.search}%,brand.ilike.%${query.search}%,category_name.ilike.%${query.search}%`
    );
  }

  switch (query.sort) {
    case "newest":
      q = q.order("created_at", { ascending: false });
      break;
    case "priceLowHigh":
      q = q.order("min_price", { ascending: true });
      break;
    case "priceHighLow":
      q = q.order("min_price", { ascending: false });
      break;
    case "highestRated":
      q = q.order("rating", { ascending: false });
      break;
    case "bestSelling":
      q = q.order("review_count", { ascending: false });
      break;
    default:
      q = q.order("sort_order", { ascending: true });
  }

  if (query.limit && query.limit > 0) q = q.limit(query.limit);

  const { data, error } = await q;
  if (error) throw new Error(`Failed to fetch products: ${error.message}`);
  if (!data) return [];
  return (data as Row[]).map((row) =>
    mapProduct(
      row,
      (row.images as Row[]) ?? [],
      (row.variants as Row[]) ?? []
    )
  );
}

export async function getProductsSupabase(query: ProductQuery = {}): Promise<Product[]> {
  let products = await fetchProducts(query);
  if (query.minPrice != null || query.maxPrice != null || query.size || query.availability) {
    products = products.filter((p) => {
      if (query.minPrice != null && !p.variants.some((v) => (v.salePrice ?? v.price) >= query.minPrice!)) return false;
      if (query.maxPrice != null && !p.variants.some((v) => (v.salePrice ?? v.price) <= query.maxPrice!)) return false;
      if (query.size) {
        const sizes = Array.isArray(query.size) ? query.size : [query.size];
        if (!p.variants.some((v) => sizes.some((s) => v.size.toLowerCase().includes(s.toLowerCase())))) return false;
      }
      if (query.availability === "in_stock" && !p.variants.some((v) => v.stock > 0)) return false;
      if (query.availability === "out_of_stock" && p.variants.some((v) => v.stock > 0)) return false;
      return true;
    });
  }
  return products;
}

export async function getProductBySlugSupabase(slug: string): Promise<Product | null> {
  const client = await createServerClient();
  const { data } = await client
    .from("products")
    .select(
      `*,
      category:product_categories(name),
      images:product_images(id, url, alt, sort_order),
      variants:product_variants(id, size, price, sale_price, stock, sku)`
    )
    .eq("slug", slug)
    .single();
  if (!data) return null;
  return mapProduct(
    data as Row,
    ((data as Row).images as Row[]) ?? [],
    ((data as Row).variants as Row[]) ?? []
  );
}

export async function getRelatedProductsSupabase(product: Product, limit = 4): Promise<Product[]> {
  const client = await createServerClient();
  const { data, error } = await client
    .from("products")
    .select(
      `*,
      category:product_categories(name),
      images:product_images(id, url, alt, sort_order),
      variants:product_variants(id, size, price, sale_price, stock, sku)`
    )
    .or(`fragrance_family.eq.${product.fragranceFamily},gender.eq.${product.gender}`)
    .neq("id", product.id)
    .limit(limit * 3);
  if (error) return [];
  const mapped = ((data as Row[]) ?? []).map((row) =>
    mapProduct(row, (row.images as Row[]) ?? [], (row.variants as Row[]) ?? [])
  );
  return mapped.slice(0, limit);
}

export async function getCategoriesSupabase(): Promise<Category[]> {
  const client = await createServerClient();
  const { data, error } = await client
    .from("product_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
  return ((data as Row[]) ?? []).map((c) => ({
    id: String(c.id),
    name: String(c.name),
    slug: String(c.slug),
    description: (c.description as string | null) ?? null,
    image: (c.image as string | null) ?? null,
    sortOrder: Number(c.sort_order ?? 0),
  }));
}

export async function getDeliveryZonesSupabase(): Promise<DeliveryZone[]> {
  const client = await createServerClient();
  const { data, error } = await client
    .from("delivery_zones")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Failed to fetch delivery zones: ${error.message}`);
  return ((data as Row[]) ?? [])
    .filter((z) => z.active !== false)
    .map((z) => ({
      id: String(z.id),
      name: String(z.name),
      cities: (z.cities as string[]) ?? [],
      fee: Number(z.fee),
      estimatedDays: String(z.estimated_days),
      active: z.active !== false,
    }));
}

export async function getReviewsSupabase(): Promise<Review[]> {
  const client = await createServerClient();
  const { data, error } = await client
    .from("reviews")
    .select(`*, product:products(name)`)
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(24);
  if (error) throw new Error(`Failed to fetch reviews: ${error.message}`);
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

export async function getProductReviewsSupabase(productId: string): Promise<Review[]> {
  const client = await createServerClient();
  const { data, error } = await client
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(6);
  if (error) return [];
  return ((data as Row[]) ?? []).map((r) => ({
    id: String(r.id),
    productId: String(r.product_id),
    productName: "",
    customerName: String(r.customer_name),
    rating: Number(r.rating),
    title: (r.title as string | null) ?? null,
    content: String(r.content),
    verified: Boolean(r.verified) || Boolean(r.created_by_user_id),
    approved: true,
    createdAt: String(r.created_at),
  }));
}

export async function getBrandsSupabase(): Promise<string[]> {
  const client = await createServerClient();
  const { data, error } = await client.from("products").select("brand").order("brand", { ascending: true });
  if (error) return [];
  return Array.from(new Set(((data as Row[]) ?? []).map((d) => String(d.brand))));
}

export async function getOrdersSupabase(): Promise<Order[]> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("orders")
    .select(`*, items:order_items(*)`)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
  return ((data as Row[]) ?? []).map(mapOrder);
}

export async function getOrdersByUserSupabase(userId: string): Promise<Order[]> {
  const client = await createServerClient();
  const { data, error } = await client
    .from("orders")
    .select(`*, items:order_items(*)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
  return ((data as Row[]) ?? []).map(mapOrder);
}

export async function getOrderByIdSupabase(orderId: string): Promise<Order | null> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("orders")
    .select(`*, items:order_items(*)`)
    .eq("id", orderId)
    .single();
  if (error || !data) return null;
  return mapOrder(data as Row);
}

export async function getOrderByReferenceSupabase(reference: string): Promise<Order | null> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("orders")
    .select(`*, items:order_items(*)`)
    .eq("payment_reference", reference)
    .single();
  if (error || !data) return null;
  return mapOrder(data as Row);
}

export async function getOrderByNumberAndPhoneSupabase(orderNumber: string, phone: string): Promise<Order | null> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("orders")
    .select(`*, items:order_items(*)`)
    .eq("order_number", orderNumber.trim().toUpperCase())
    .eq("customer_phone", phone.trim())
    .single();
  if (error || !data) return null;
  return mapOrder(data as Row);
}

export async function updateOrderStatusSupabase(
  orderId: string,
  patch: Partial<Pick<Order, "paymentStatus" | "orderStatus">>
): Promise<Order | null> {
  const client = createAdminClient();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.paymentStatus) updates.payment_status = patch.paymentStatus;
  if (patch.orderStatus) updates.order_status = patch.orderStatus;
  const { data, error } = await client
    .from("orders")
    .update(updates)
    .eq("id", orderId)
    .select(`*, items:order_items(*)`)
    .single();
  if (error || !data) return null;
  return mapOrder(data as Row);
}

export interface PersistOrderParams {
  order: Order;
  rawItems: Order["items"];
}

/**
 * Create an order with its items and a pending payment row, and deduct
 * inventory — atomically guarded by RLS + service role.
 */
export async function persistOrderSupabase(params: PersistOrderParams): Promise<Order> {
  const client = createAdminClient();
  const { order, rawItems } = params;

  const { data: orderRow, error: orderError } = await client
    .from("orders")
    .insert({
      id: order.id,
      order_number: order.orderNumber,
      user_id: order.userId,
      customer_name: order.customer.name,
      customer_phone: order.customer.phone,
      customer_email: order.customer.email,
      region: order.customer.region,
      city: order.customer.city,
      address: order.customer.address,
      delivery_note: order.customer.note,
      delivery_zone_id: null,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      discount: order.discount,
      total: order.total,
      coupon_code: order.coupon?.code ?? null,
      coupon_type: order.coupon?.type ?? null,
      coupon_value: order.coupon?.value ?? null,
      payment_status: order.paymentStatus,
      order_status: order.orderStatus,
      payment_reference: order.paymentReference,
    })
    .select("id")
    .single();
  if (orderError) throw new Error("We couldn't create your order. Please try again.");

  const itemsError = await insertOrderItems(client, orderRow.id as string, rawItems);
  if (itemsError) throw itemsError;

  await deductInventorySupabase(client, rawItems);

  await client.from("payments").insert({
    order_id: orderRow.id as string,
    reference: order.paymentReference,
    provider: "paystack",
    status: order.paymentStatus,
    amount: order.total,
  });

  return { ...order, id: String(orderRow.id) };
}

async function insertOrderItems(client: SupabaseClient, orderId: string, items: Order["items"]) {
  const rows = items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    variant_id: item.variantId,
    product_name: item.productName,
    product_slug: item.productSlug,
    brand: item.brand,
    size: item.size,
    image: item.image,
    unit_price: item.unitPrice,
    quantity: item.quantity,
  }));
  const { error } = await client.from("order_items").insert(rows);
  if (error) return new Error("We couldn't record your order items. Please try again.");
  return null;
}

async function deductInventorySupabase(client: SupabaseClient, items: Order["items"]) {
  for (const item of items) {
    const { error } = await client.rpc("decrement_variant_stock", {
      p_variant_id: item.variantId,
      p_quantity: item.quantity,
    });
    if (error) {
      throw new Error("Some items are no longer in stock. Please refresh and try again.");
    }
  }
}

function mapOrder(row: Row): Order {
  const items = (row.items as Row[]) ?? [];
  return {
    id: String(row.id),
    orderNumber: String(row.order_number),
    userId: (row.user_id as string | null) ?? null,
    customer: {
      name: String(row.customer_name ?? ""),
      phone: String(row.customer_phone ?? ""),
      email: String(row.customer_email ?? ""),
      region: String(row.region ?? ""),
      city: String(row.city ?? ""),
      address: String(row.address ?? ""),
      note: (row.delivery_note as string | null) ?? null,
    },
    items: items.map((it) => ({
      id: String(it.id),
      productId: String(it.product_id),
      productName: String(it.product_name),
      productSlug: String(it.product_slug ?? ""),
      brand: String(it.brand ?? ""),
      variantId: String(it.variant_id ?? ""),
      size: String(it.size ?? ""),
      image: (it.image as string | null) ?? null,
      unitPrice: Number(it.unit_price),
      quantity: Number(it.quantity),
    })),
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    discount: Number(row.discount),
    total: Number(row.total),
    coupon: row.coupon_code
      ? { code: String(row.coupon_code), type: row.coupon_type as "percentage" | "fixed", value: Number(row.coupon_value) }
      : null,
    paymentStatus: (row.payment_status as Order["paymentStatus"]) ?? "pending",
    orderStatus: (row.order_status as Order["orderStatus"]) ?? "pending",
    paymentReference: (row.payment_reference as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at ?? ""),
  };
}

export async function getCouponsSupabase(): Promise<Coupon[]> {
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

export async function getAdminStatsSupabase(): Promise<AdminStats> {
  const client = createAdminClient();
  const [ordersRes, productsRes] = await Promise.all([
    client
      .from("orders")
      .select("id, total, payment_status, customer_email")
      .eq("payment_status", "paid"),
    client.from("products").select("id, variants:product_variants(stock)"),
  ]);
  const paidOrders = (ordersRes.data as Row[]) ?? [];
  const revenue = paidOrders.reduce((s, o) => s + Number(o.total), 0);
  const customers = new Set((paidOrders as Row[]).map((o) => String(o.customer_email ?? "").toLowerCase()));
  const products = (productsRes.data as Row[]) ?? [];
  const lowStock = products.filter((p) =>
    ((p.variants as Row[]) ?? []).some((v) => Number(v.stock) > 0 && Number(v.stock) <= 10)
  ).length;
  const outOfStock = products.filter((p) =>
    ((p.variants as Row[]) ?? []).every((v) => Number(v.stock) <= 0)
  ).length;
  return {
    revenue,
    orders: paidOrders.length,
    customers: customers.size,
    averageOrderValue: paidOrders.length ? Math.round(revenue / paidOrders.length) : 0,
    products: products.length,
    lowStock,
    outOfStock,
  };
}