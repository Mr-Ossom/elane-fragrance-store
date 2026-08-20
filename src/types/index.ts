export type Gender = "men" | "women" | "unisex";

export type FragranceFamily =
  | "Fresh"
  | "Woody"
  | "Sweet"
  | "Floral"
  | "Oud"
  | "Citrus"
  | "Musky"
  | "Oriental";

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  price: number;
  salePrice: number | null;
  stock: number;
  sku: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
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
  isDemo?: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  title: string | null;
  content: string;
  verified: boolean;
  approved: boolean;
  createdAt: string;
}

export type OrderStatus =
  | "pending"
  | "payment_confirmed"
  | "processing"
  | "ready_for_delivery"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  brand: string;
  variantId: string;
  size: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
}

export interface CouponSummary {
  code: string;
  type: "percentage" | "fixed";
  value: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  customer: {
    name: string;
    phone: string;
    email: string;
    region: string;
    city: string;
    address: string;
    note: string | null;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  coupon: CouponSummary | null;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentReference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  cities: string[];
  fee: number;
  estimatedDays: string;
  active: boolean;
}

export interface CartLine {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number | null;
  maxUses: number | null;
  uses: number;
  expiresAt: string | null;
  active: boolean;
}

export type SortOption =
  | "featured"
  | "newest"
  | "bestSelling"
  | "priceLowHigh"
  | "priceHighLow"
  | "highestRated";

export interface ProductQuery {
  category?: string | string[];
  gender?: string | string[];
  family?: string | string[];
  brand?: string | string[];
  size?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  availability?: "in_stock" | "out_of_stock";
  search?: string;
  sort?: SortOption;
  bestseller?: boolean;
  newArrival?: boolean;
  featured?: boolean;
  limit?: number;
}

export interface AdminStats {
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
  products: number;
  lowStock: number;
  outOfStock: number;
}