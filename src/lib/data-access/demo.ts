import { categories, deliveryZones, getDemoProducts, sampleReviews } from "@/lib/data/catalog";
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

/**
 * In-memory development store used when Supabase environment variables are not
 * configured. It powers the full storefront + admin preview so the UI can be
 * developed and demonstrated without external credentials.
 *
 * NOTE: Orders/coupons/reviews written here are NOT persisted. Once
 * NEXT_PUBLIC_SUPABASE_URL is configured, all reads/writes go to Supabase.
 */

const orders: Order[] = [];
let orderCounter = 1000;

export function assignOrderNumber(): string {
  orderCounter += 1;
  return `GN-${new Date().getFullYear()}-${orderCounter}`;
}

export async function getCategoriesDemo(): Promise<Category[]> {
  return categories;
}

export async function getDeliveryZonesDemo(): Promise<DeliveryZone[]> {
  return deliveryZones;
}

export async function getProductsDemo(query: ProductQuery = {}): Promise<Product[]> {
  let products = getDemoProducts();

  if (query.bestseller) products = products.filter((p) => p.bestseller);
  if (query.newArrival) products = products.filter((p) => p.newArrival);
  if (query.featured) products = products.filter((p) => p.featured);

  if (query.category) {
    const cats = Array.isArray(query.category) ? query.category : [query.category];
    products = products.filter((p) => cats.includes(p.categorySlug));
  }
  if (query.gender) {
    const genders = Array.isArray(query.gender) ? query.gender : [query.gender];
    products = products.filter((p) => genders.includes(p.gender));
  }
  if (query.family) {
    const families = Array.isArray(query.family) ? query.family : [query.family];
    products = products.filter((p) => families.includes(p.fragranceFamily));
  }
  if (query.brand) {
    const brands = Array.isArray(query.brand) ? query.brand : [query.brand];
    products = products.filter((p) => brands.includes(p.brand));
  }
  if (query.size) {
    const sizes = Array.isArray(query.size) ? query.size : [query.size];
    products = products.filter((p) =>
      p.variants.some((v) => sizes.some((s) => v.size.toLowerCase().includes(s.toLowerCase())))
    );
  }
  if (query.minPrice != null) {
    products = products.filter((p) =>
      p.variants.some((v) => (v.salePrice ?? v.price) >= query.minPrice!)
    );
  }
  if (query.maxPrice != null) {
    products = products.filter((p) =>
      p.variants.some((v) => (v.salePrice ?? v.price) <= query.maxPrice!)
    );
  }
  if (query.rating != null) {
    products = products.filter((p) => p.rating >= query.rating!);
  }
  if (query.availability === "in_stock") {
    products = products.filter((p) => p.variants.some((v) => v.stock > 0));
  }
  if (query.availability === "out_of_stock") {
    products = products.filter((p) => p.variants.every((v) => v.stock <= 0));
  }

  if (query.search) {
    const q = query.search.toLowerCase().trim();
    products = products.filter((p) => {
      const notes = [...p.topNotes, ...p.heartNotes, ...p.baseNotes].join(" ").toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        notes.includes(q)
      );
    });
  }

  products = sortProducts(products, query.sort ?? "featured");

  if (query.limit && query.limit > 0) {
    products = products.slice(0, query.limit);
  }
  return products;
}

function sortProducts(products: Product[], sort: ProductQuery["sort"]): Product[] {
  const list = [...products];
  switch (sort) {
    case "newest":
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "bestSelling":
      return list.sort((a, b) => b.reviewCount - a.reviewCount || Number(b.bestseller) - Number(a.bestseller));
    case "priceLowHigh": {
      const min = (p: Product) => Math.min(...p.variants.map((v) => v.salePrice ?? v.price));
      return list.sort((a, b) => min(a) - min(b));
    }
    case "priceHighLow": {
      const min = (p: Product) => Math.min(...p.variants.map((v) => v.salePrice ?? v.price));
      return list.sort((a, b) => min(b) - min(a));
    }
    case "highestRated":
      return list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "featured":
    default:
      return list.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          Number(b.bestseller) - Number(a.bestseller)
      );
  }
}

export async function getProductBySlugDemo(slug: string): Promise<Product | null> {
  return getDemoProducts().find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProductsDemo(product: Product, limit = 4): Promise<Product[]> {
  const sameFamily = getDemoProducts().filter(
    (p) => p.id !== product.id && (p.fragranceFamily === product.fragranceFamily || p.gender === product.gender)
  );
  return sameFamily.slice(0, limit).length > 0
    ? sameFamily.slice(0, limit)
    : getDemoProducts()
        .filter((p) => p.id !== product.id)
        .slice(0, limit);
}

export async function getReviewsDemo(): Promise<Review[]> {
  return sampleReviews.filter((r) => r.approved);
}

const reviewNames = [
  "Abena K.",
  "Kofi M.",
  "Nana A.",
  "Efua S.",
  "Yaw B.",
  "Adjoa T.",
  "Kojo E.",
  "Akosua F.",
];

const reviewTexts = {
  top: [
    "Longevity is incredible — it stayed on my clothes till the next morning.",
    "Compliments all day. People keep asking what I'm wearing.",
    "Smells far more expensive than it costs. Worth every pesewa.",
    "Beautiful presentation and the scent is outstanding.",
    "I ordered on WhatsApp and it arrived the same day. Very impressed.",
  ],
  mid: [
    "Great fragrance, projects really well in our heat.",
    "Very close to the original. I'm honestly surprised.",
    "My favourite purchase this year. Will definitely buy again.",
    "Perfect for evenings out. Everyone noticed it.",
  ],
};

function seededNumber(seed: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash % mod);
}

export async function getProductReviewsDemo(productId: string): Promise<Review[]> {
  const product = getDemoProducts().find((p) => p.id === productId);
  if (!product) return [];
  const count = 2 + seededNumber(productId, 3);
  const baseRating = Math.round(product.rating);
  const generated: Review[] = Array.from({ length: count }).map((_, i) => {
    const name = reviewNames[seededNumber(productId + i, reviewNames.length)];
    const pool = i < 2 ? reviewTexts.top : reviewTexts.mid;
    const text = pool[seededNumber(productId + i, pool.length)];
    const rating = Math.max(3, Math.min(5, baseRating + (i % 2 === 0 ? 0 : -1)));
    const daysAgo = 3 + i * 11 + seededNumber(productId + i, 20);
    const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString();
    return {
      id: `gen-${productId}-${i}`,
      productId,
      productName: product.name,
      customerName: name,
      rating,
      title: null,
      content: text,
      verified: true,
      approved: true,
      createdAt,
    };
  });
  return generated.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAvailableSizesDemo(): Promise<string[]> {
  const sizes = new Set<string>();
  for (const p of getDemoProducts()) {
    for (const v of p.variants) sizes.add(v.size.replace(/[0-9]/g, "").trim() || v.size);
  }
  return Array.from(sizes);
}

export async function getBrandsDemo(): Promise<string[]> {
  return Array.from(new Set(getDemoProducts().map((p) => p.brand))).sort();
}

export async function getOrdersDemo(): Promise<Order[]> {
  return [...orders].reverse();
}

export async function createOrderDemo(order: Order): Promise<Order> {
  orders.push(order);
  return order;
}

/** Deduct stock from the in-memory demo catalog. Returns the affected lines. */
export async function deductInventoryDemo(lines: { variantId: string; quantity: number }[]): Promise<void> {
  const catalog = getDemoProducts();
  for (const line of lines) {
    for (const p of catalog) {
      const variant = p.variants.find((v) => v.id === line.variantId);
      if (variant) variant.stock = Math.max(0, variant.stock - line.quantity);
    }
  }
}

export async function getOrderByIdDemo(orderId: string): Promise<Order | null> {
  return orders.find((o) => o.id === orderId) ?? null;
}

export async function updateOrderDemo(orderId: string, patch: Partial<Order>): Promise<Order | null> {
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], ...patch, updatedAt: new Date().toISOString() };
  return orders[idx];
}

export async function getOrderByReferenceDemo(reference: string): Promise<Order | null> {
  return orders.find((o) => o.paymentReference === reference) ?? null;
}

const demoCoupons: Coupon[] = [
  {
    id: "coupon-1",
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minOrder: 150,
    maxUses: null,
    uses: 0,
    expiresAt: null,
    active: true,
  },
  {
    id: "coupon-2",
    code: "GH20",
    type: "fixed",
    value: 20,
    minOrder: 200,
    maxUses: 100,
    uses: 12,
    expiresAt: null,
    active: true,
  },
];

export async function getCouponsDemo(): Promise<Coupon[]> {
  return demoCoupons;
}

export async function getAdminStatsDemo(): Promise<AdminStats> {
  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const customers = new Set<number>();
  paidOrders.forEach((o) => {
    let hash = 0;
    const name = (o.customer?.name ?? o.customer?.phone ?? "").toLowerCase();
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
    customers.add(hash);
  });
  const products = getDemoProducts();
  return {
    revenue,
    orders: paidOrders.length,
    customers: customers.size || 0,
    averageOrderValue: paidOrders.length ? Math.round(revenue / paidOrders.length) : 0,
    products: products.length,
    lowStock: products.filter((p) => p.variants.some((v) => v.stock > 0 && v.stock <= 10)).length,
    outOfStock: products.filter((p) => p.variants.every((v) => v.stock <= 0)).length,
  };
}