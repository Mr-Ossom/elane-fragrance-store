import type { Metadata } from "next";
import { Suspense } from "react";
import { getBrands, getCategories, getProducts } from "@/lib/data-access/store";
import type { ProductQuery, SortOption } from "@/types";
import { ShopClient } from "@/components/shop/shop-client";
import { ShopSkeleton } from "@/components/shop/shop-skeleton";

export const metadata: Metadata = {
  title: "Shop All Fragrances",
  description:
    "Browse premium perfumes, body colognes, perfume oils and gift sets. Filter by category, gender, fragrance family, brand and price.",
};

const sortValues: SortOption[] = [
  "featured",
  "newest",
  "bestSelling",
  "priceLowHigh",
  "priceHighLow",
  "highestRated",
];

function parseParam(searchParams: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const query: ProductQuery = {};
  const q = parseParam(params, "q");
  const category = parseParam(params, "category");
  const gender = parseParam(params, "gender");
  const family = parseParam(params, "family");
  const brand = parseParam(params, "brand");
  const size = parseParam(params, "size");
  const min = parseParam(params, "min");
  const max = parseParam(params, "max");
  const rating = parseParam(params, "rating");
  const availability = parseParam(params, "availability");
  const sort = parseParam(params, "sort") as SortOption | undefined;

  if (q) query.search = q;
  if (category) query.category = category.split(",");
  if (gender) query.gender = gender.split(",");
  if (family) query.family = family.split(",");
  if (brand) query.brand = brand.split(",");
  if (size) query.size = size.split(",");
  if (min) query.minPrice = Number(min);
  if (max) query.maxPrice = Number(max);
  if (rating) query.rating = Number(rating);
  if (availability === "in_stock" || availability === "out_of_stock") query.availability = availability;
  query.sort = sortValues.includes(sort ?? "featured") ? (sort as SortOption) : "featured";

  const [products, categories, brands] = await Promise.all([
    getProducts(query),
    getCategories(),
    getBrands(),
  ]);

  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopClient
        products={products}
        categories={categories}
        brands={brands}
        initialQuery={query}
      />
    </Suspense>
  );
}