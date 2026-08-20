#!/usr/bin/env node
/**
 * Seed the (empty) Supabase project from db/schema.sql with
 * categories, delivery zones, coupons and a starter catalog.
 *
 * Usage:
 *   1. Run db/schema.sql in the Supabase SQL editor.
 *   2. Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *      (reads .env.local automatically).
 *   3. npm run db:seed
 *
 * Safe to re-run: categories/zones/coupons/products upsert by key.
 */
import { readFileSync, existsSync } from "node:fs";

try {
  for (const file of [".env", ".env.local"]) {
    if (existsSync(file)) {
      const env = readFileSync(file, "utf8");
      for (const line of env.split("\n")) {
        const [k, ...rest] = line.trim().split("=");
        if (k && !process.env[k]) process.env[k] = rest.join("=").replace(/^["']|["']$/g, "");
      }
    }
  }
} catch {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env or .env.local"
  );
  process.exit(1);
}

const api = `${url.replace(/\/$/, "")}/rest/v1`;
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates,return=representation",
};

async function upsert(table, rows) {
  if (!rows.length) return;
  const res = await fetch(`${api}/${table}`, {
    method: "POST",
    headers,
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    console.error(`  ✗ ${table}: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  console.log(`  ✓ ${table}: ${rows.length} row(s)`);
}

const unsplash = (id) => `https://images.unsplash.com/photo-${id}?q=80&w=1600&auto=format&fit=crop`;

const categories = [
  { id: "cat-womens", name: "Women", slug: "women", description: "Elegant, feminine and unforgettable", image: unsplash("1588405748880-12d1d2a59f75"), sort_order: 1 },
  { id: "cat-mens", name: "Men", slug: "men", description: "Bold, confident and refined", image: unsplash("1615634260167-c8cdede054de"), sort_order: 2 },
  { id: "cat-unisex", name: "Unisex", slug: "unisex", description: "Scents shared and loved by all", image: unsplash("1592945403244-b3fbafd7f539"), sort_order: 3 },
  { id: "cat-discovery", name: "Discovery Sets", slug: "discovery-sets", description: "Curated samplers to find your signature", image: unsplash("1547887538-e3a2f32cb1cc"), sort_order: 4 },
];

const zones = [
  { id: "z-accra", name: "Greater Accra", cities: ["Accra", "Tema", "Adenta", "Madina", "East Legon", "Osu", "Cantonments"], fee: 25, estimated_days: "1–2 working days", sort_order: 1, active: true },
  { id: "z-kumasi", name: "Ashanti", cities: ["Kumasi", "Ejisu", "Oforikrom", "Atonsu"], fee: 45, estimated_days: "2–4 working days", sort_order: 2, active: true },
  { id: "z-western", name: "Western", cities: ["Takoradi", "Sekondi", "Tarkwa"], fee: 55, estimated_days: "2–4 working days", sort_order: 3, active: true },
  { id: "z-cape-coast", name: "Central", cities: ["Cape Coast", "Elmina", "Kasoa"], fee: 50, estimated_days: "2–4 working days", sort_order: 4, active: true },
  { id: "z-northern", name: "Northern", cities: ["Tamale", "Yendi", "Savelugu"], fee: 80, estimated_days: "3–6 working days", sort_order: 5, active: true },
  { id: "z-east", name: "Eastern", cities: ["Koforidua", "Nkawkaw", "Akosombo"], fee: 50, estimated_days: "2–4 working days", sort_order: 6, active: true },
];

const coupons = [
  { code: "WELCOME10", type: "percentage", value: 10, min_order: 150, max_uses: 500, uses: 0, active: true, expires_at: null },
  { code: "SIGNATURE20", type: "percentage", value: 20, min_order: 500, max_uses: 200, uses: 0, active: true, expires_at: null },
  { code: "GHANA200", type: "fixed", value: 40, min_order: 400, max_uses: 100, uses: 0, active: true, expires_at: null },
];

const seedImages = [
  unsplash("1609749282774-5883a366cdd1"),
  unsplash("1541643600914-78b084683601"),
  unsplash("1594035910387-fea47794261f"),
  unsplash("1523293182086-7651a899d37f"),
  unsplash("1592945403244-b3fbafd7f539"),
];
const image = (slug) => {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return { url: seedImages[hash % seedImages.length], alt: `${slug.replace(/-/g, " ")} — ÉLANÉ`, sort_order: 1 };
};

const products = [
  {
    name: "Midnight Oud", slug: "midnight-oud", brand: "Byredo", category_id: "cat-mens", category_slug: "men", category_name: "Men",
    gender: "men", fragrance_family: "Amber Woody", description: "A deep, smoky oud wrapped in amber and vetiver for stays that linger long after dark.",
    top_notes: ["Bergamot", "Saffron"], heart_notes: ["Oud", "Rose"], base_notes: ["Amber", "Vetiver", "Musk"], longevity: "Long lasting",
    sillage: "Heavy", occasion: "Evening / Formal", featured: true, bestseller: true, new_arrival: false, rating: 4.8, review_count: 46, min_price: 1299, sort_order: 1,
    images: [image("midnight-oud")], variants: [{ size: "50ml EDP", price: 1299, sale_price: 1099, stock: 18, sku: "EL-BYR-50" }],
  },
  {
    name: "Silk & Smoke", slug: "silk-smoke", brand: "Maison Margiela", category_id: "cat-womens", category_slug: "women", category_name: "Women",
    gender: "women", fragrance_family: "Oriental", description: "Delicate silk and whispering smoke — a soft, magnetic veil of vanilla, incense and iris.",
    top_notes: ["Pink Pepper", "Aldehydes"], heart_notes: ["Iris", "Incense"], base_notes: ["Vanilla", "Patchouli"], longevity: "Long lasting",
    sillage: "Moderate", occasion: "Evening / Dinner", featured: true, bestseller: true, new_arrival: false, rating: 4.9, review_count: 61, min_price: 1450, sort_order: 2,
    images: [image("silk-smoke")], variants: [{ size: "50ml EDP", price: 1450, sale_price: 1299, stock: 12, sku: "EL-MM-50" }],
  },
  {
    name: "Cocoa Musk", slug: "cocoa-musk", brand: "Narciso Rodriguez", category_id: "cat-unisex", category_slug: "unisex", category_name: "Unisex",
    gender: "unisex", fragrance_family: "Sweet", description: "Velvety cocoa and warm musk — comfort in a bottle, made for everyday luxury.",
    top_notes: ["Bergamot", "Orange"], heart_notes: ["Cocoa", "Praline"], base_notes: ["White Musk", "Sandalwood"], longevity: "Moderate",
    sillage: "Soft", occasion: "Daily / Office", featured: true, bestseller: false, new_arrival: true, rating: 4.6, review_count: 22, min_price: 899, sort_order: 3,
    images: [image("cocoa-musk")], variants: [{ size: "50ml EDT", price: 899, sale_price: null, stock: 8, sku: "EL-NR-50" }],
  },
  {
    name: "Oud & Amber", slug: "oud-amber", brand: "Tom Ford", category_id: "cat-mens", category_slug: "men", category_name: "Men",
    gender: "men", fragrance_family: "Amber Woody", description: "Opulent oud with molten amber — an unapologetically bold statement fragrance.",
    top_notes: ["Cardamom", "Saffron"], heart_notes: ["Rose Absolute", "Oud"], base_notes: ["Amber", "Leather"], longevity: "Long lasting",
    sillage: "Heavy", occasion: "Evening / Formal", featured: true, bestseller: false, new_arrival: true, rating: 4.7, review_count: 31, min_price: 2100, sort_order: 4,
    images: [image("oud-amber")], variants: [{ size: "50ml EDP", price: 2100, sale_price: 1899, stock: 0, sku: "EL-TF-50" }],
  },
  {
    name: "Wednesday Child", slug: "wednesday-child", brand: "Jo Malone London", category_id: "cat-womens", category_slug: "women", category_name: "Women",
    gender: "women", fragrance_family: "Floral", description: "Full of woe or full of wonder? A bright, dewy floral with peony, muguet and white musk.",
    top_notes: ["Peony", "Blackcurrant"], heart_notes: ["Muguet", "Carnation"], base_notes: ["White Musk"], longevity: "Moderate",
    sillage: "Soft", occasion: "Day / Weddings", featured: true, bestseller: false, new_arrival: false, rating: 4.5, review_count: 19, min_price: 1099, sort_order: 5,
    images: [image("wednesday-child")], variants: [{ size: "30ml Cologne", price: 1099, sale_price: null, stock: 25, sku: "EL-JM-30" }],
  },
];

const seedProducts = !process.argv.includes("--no-products");

console.log("Seeding Supabase…");
await upsert("product_categories", categories);
await upsert("delivery_zones", zones);
await upsert("coupons", coupons);

if (!seedProducts) {
  console.log("\nSkipping products (--no-products). Storefront catalog stays empty.");
  process.exit(0);
}

for (const p of products) {
  const { variants, images, ...product } = p;
  const [inserted] = await (await fetch(`${api}/products?select=id`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify([product]),
  })).json();
  await upsert(
    "product_variants",
    variants.map((v) => ({ ...v, product_id: inserted.id }))
  );
  await upsert(
    "product_images",
    images.map((i) => ({ ...i, product_id: inserted.id }))
  );
  console.log(`  ✓ product: ${p.slug}`);
}

console.log("\nDone. Storefront now runs against Supabase when env keys are set.");