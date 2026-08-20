"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Category } from "@/types";
import type { ProductQuery } from "@/types";
import { ProductGrid } from "@/components/product-grid";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { ShopFilters, type FilterState } from "@/components/shop/shop-filters";
import { SortSelect } from "@/components/shop/sort-select";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface ShopClientProps {
  products: import("@/types").Product[];
  categories: Category[];
  brands: string[];
  initialQuery: ProductQuery;
}

function initialState(query: ProductQuery, search: URLSearchParams): FilterState {
  return {
    q: query.search ?? search.get("q") ?? "",
    category: new Set(Array.isArray(query.category) ? query.category : query.category ? [query.category] : []),
    gender: new Set(Array.isArray(query.gender) ? query.gender : query.gender ? [query.gender] : []),
    family: new Set(Array.isArray(query.family) ? query.family : query.family ? [query.family] : []),
    brand: new Set(Array.isArray(query.brand) ? query.brand : query.brand ? [query.brand] : []),
    size: new Set(Array.isArray(query.size) ? query.size : query.size ? [query.size] : []),
    minPrice: query.minPrice ?? (search.get("min") ? Number(search.get("min")) : undefined),
    maxPrice: query.maxPrice ?? (search.get("max") ? Number(search.get("max")) : undefined),
    rating: query.rating ?? (search.get("rating") ? Number(search.get("rating")) : undefined),
    availability: "in_stock" as const,
    sort: query.sort ?? "featured",
  };
}

export function ShopClient({
  products,
  categories,
  brands,
  initialQuery,
}: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = React.useState<FilterState>(() =>
    initialState(initialQuery, searchParams)
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  const applyFilters = React.useCallback(
    (next: FilterState, push = true) => {
      setFilters(next);
      if (!push) return;
      const url = new URLSearchParams(searchParams.toString());
      for (const key of ["category", "gender", "family", "brand", "size", "min", "max", "rating", "q", "sort"] as const) {
        url.delete(key);
      }
      if (next.q) url.set("q", next.q);
      if (next.category.size) url.set("category", [...next.category].join(","));
      if (next.gender.size) url.set("gender", [...next.gender].join(","));
      if (next.family.size) url.set("family", [...next.family].join(","));
      if (next.brand.size) url.set("brand", [...next.brand].join(","));
      if (next.size.size) url.set("size", [...next.size].join(","));
      if (next.minPrice != null) url.set("min", String(next.minPrice));
      if (next.maxPrice != null) url.set("max", String(next.maxPrice));
      if (next.rating != null) url.set("rating", String(next.rating));
      if (next.sort && next.sort !== "featured") url.set("sort", next.sort);
      router.push(`/shop${url.toString() ? `?${url.toString()}` : ""}`, { scroll: false });
    },
    [router, searchParams]
  );

  const resetFilters = React.useCallback(() => {
    const empty: FilterState = {
      q: "",
      category: new Set(),
      gender: new Set(),
      family: new Set(),
      brand: new Set(),
      size: new Set(),
      minPrice: undefined,
      maxPrice: undefined,
      rating: undefined,
      availability: "in_stock",
      sort: "featured",
    };
    setFilters(empty);
    router.push("/shop", { scroll: false });
  }, [router]);

  const activeCount =
    filters.category.size +
    filters.gender.size +
    filters.family.size +
    filters.brand.size +
    filters.size.size +
    (filters.minPrice != null ? 1 : 0) +
    (filters.maxPrice != null ? 1 : 0) +
    (filters.rating != null ? 1 : 0);

  const filtersPanel = (
    <ShopFilters
      filters={filters}
      categories={categories}
      brands={brands}
      onChange={(next) => applyFilters(next)}
      onReset={resetFilters}
    />
  );

  return (
    <div className="container-site py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl">Shop All</h1>
          <p className="mt-2 text-muted-foreground">
            {products.length} fragrance{products.length === 1 ? "" : "s"}
            {filters.q ? ` for “${filters.q}”` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SortSelect
            value={filters.sort}
            onChange={(sort) => applyFilters({ ...filters, sort })}
          />
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-champagne px-1.5 text-[11px] font-semibold text-charcoal-deep">
                {activeCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-thin">
            {filtersPanel}
          </div>
        </aside>

        <div>
          {products.length === 0 ? (
            <EmptyState
              icon={<Search size={24} />}
              title="No fragrances found"
              description="Try adjusting your filters or searching for another note, brand or category."
              action={
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear all filters
                </Button>
              }
            />
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[85svh] rounded-t-md">
          <SheetHeader>
            <div className="flex w-full items-center justify-between pr-8">
              <SheetTitle>Filters</SheetTitle>
            </div>
          </SheetHeader>
          <SheetBody className="px-5 pb-6">{filtersPanel}</SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}