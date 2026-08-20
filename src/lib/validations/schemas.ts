import { z } from "zod";

export const checkouItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().min(1),
  slug: z.string().min(1),
  size: z.string().min(1),
  image: z.string().nullable().optional(),
  unitPrice: z.number().positive(),
  quantity: z.number().int().min(1).max(25),
});

export const checkoutSchema = z.object({
  items: z.array(checkouItemSchema).min(1),
  customer: z.object({
    name: z.string().trim().min(2, "Please enter your full name").max(120),
    phone: z
      .string()
      .trim()
      .min(9, "Please enter a valid phone number (e.g. 024 000 0000)")
      .max(20)
      .regex(/^[0-9+\s-]+$/, "Phone number must contain only digits"),
    email: z.string().trim().email("Please enter a valid email address"),
    region: z.string().trim().min(2, "Please select your region"),
    city: z.string().trim().min(2, "Please enter your city/town"),
    address: z.string().trim().min(5, "Please enter your delivery address"),
    note: z.string().trim().max(500).optional().or(z.literal("")),
  }),
  deliveryZoneId: z.string().min(1, "Please select your delivery area"),
  couponCode: z.string().trim().max(32).optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(100).optional().or(z.literal("")),
  content: z.string().trim().min(5, "Please write a short review").max(2000),
  customerName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().optional().or(z.literal("")),
});

export const reviewAdminSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["approve", "reject", "delete"]),
});

export const couponAdminSchema = z.object({
  id: z.string().min(1),
  code: z.string().trim().min(3).max(32).toUpperCase(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive().max(100),
  minOrder: z.coerce.number().min(0).nullable(),
  maxUses: z.coerce.number().int().min(1).nullable(),
  expiresAt: z.string().nullable(),
  active: z.coerce.boolean(),
});

export const deliveryZoneAdminSchema = z.object({
  id: z.string().min(1).nullable(),
  name: z.string().trim().min(2).max(80),
  cities: z.array(z.string().trim().min(1)).min(1),
  fee: z.coerce.number().min(0),
  estimatedDays: z.string().trim().min(2).max(80),
  active: z.coerce.boolean(),
});

export const productAdminSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(160),
  brand: z.string().trim().min(1).max(80),
  description: z.string().trim().min(10),
  category_slug: z.string().min(1),
  gender: z.enum(["men", "women", "unisex"]),
  fragrance_family: z.string().min(1),
  top_notes: z.string().trim().max(300),
  heart_notes: z.string().trim().max(300),
  base_notes: z.string().trim().max(300),
  longevity: z.string().trim().max(60).optional().or(z.literal("")),
  sillage: z.string().trim().max(60).optional().or(z.literal("")),
  occasion: z.string().trim().max(120).optional().or(z.literal("")),
  featured: z.coerce.boolean().default(false),
  bestseller: z.coerce.boolean().default(false),
  new_arrival: z.coerce.boolean().default(false),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        size: z.string().trim().min(1).max(40),
        price: z.coerce.number().positive(),
        sale_price: z.coerce.number().min(0).nullable(),
        stock: z.coerce.number().int().min(0),
        sku: z.string().trim().max(40).optional().or(z.literal("")),
      })
    )
    .min(1),
});

export const orderStatusAdminSchema = z.object({
  id: z.string().min(1),
  status: z.enum([
    "pending",
    "payment_confirmed",
    "processing",
    "ready_for_delivery",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ]),
});