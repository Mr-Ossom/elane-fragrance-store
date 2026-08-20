"use client";

import * as React from "react";
import { Check } from "lucide-react";
import type { Category, Gender, FragranceFamily, SortOption } from "@/types";
import { cn } from "@/lib/utils";

export interface FilterState {
  q: string;
  category: Set<string>;
  gender: Set<string>;
  family: Set<string>;
  brand: Set<string>;
  size: Set<string>;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  availability: "all" | "in_stock";
  sort: SortOption;
}

interface ShopFiltersProps {
  filters: FilterState;
  categories: Category[];
  brands: string[];
  onChange: (next: FilterState) => void;
  onReset: () => void;
}

const genders: Array<{ value: Gender; label: string }> = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
];

const families: FragranceFamily[] = [
  "Fresh",
  "Woody",
  "Sweet",
  "Floral",
  "Oud",
  "Citrus",
  "Musky",
  "Oriental",
];

const sizes = ["100ml", "50ml", "60ml", "70ml", "105ml", "280ml", "500ml", "12ml", "30ml", "Set"];

const priceRanges = [
  { label: "Under GH₵200", min: 0, max: 199 },
  { label: "GH₵200 – GH₵400", min: 200, max: 400 },
  { label: "GH₵400 – GH₵600", min: 400, max: 600 },
  { label: "GH₵600+", min: 600 },
];

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="border-b border-border py-1 group"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  count,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 py-1.5 text-sm text-foreground/90">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
          checked ? "border-champagne bg-champagne text-charcoal-deep" : "border-input bg-card"
        )}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </button>
      <span className="flex-1">{label}</span>
      {count != null && <span className="text-xs text-muted-foreground">{count}</span>}
    </label>
  );
}

export function ShopFilters({ filters, categories, brands, onChange, onReset }: ShopFiltersProps) {
  const toggleSet = (key: keyof Pick<FilterState, "category" | "gender" | "family" | "brand" | "size">, value: string) => {
    const next = new Set(filters[key]);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange({ ...filters, [key]: next });
  };

  const activeCount =
    filters.category.size +
    filters.gender.size +
    filters.family.size +
    filters.brand.size +
    filters.size.size +
    (filters.minPrice != null || filters.maxPrice != null ? 1 : 0) +
    (filters.rating != null ? 1 : 0);

  return (
    <div aria-label="Product filters">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Filter</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-champagne-deep underline-offset-2 hover:underline"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <FilterSection title="Category">
        {categories.map((category) => (
          <ToggleRow
            key={category.id}
            label={category.name}
            checked={filters.category.has(category.slug)}
            onChange={() => toggleSet("category", category.slug)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Gender">
        {genders.map((gender) => (
          <ToggleRow
            key={gender.value}
            label={gender.label}
            checked={filters.gender.has(gender.value)}
            onChange={() => toggleSet("gender", gender.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Fragrance Family">
        <div className="grid grid-cols-2 gap-1.5">
          {families.map((family) => (
            <button
              key={family}
              type="button"
              onClick={() => toggleSet("family", family)}
              className={cn(
                "rounded-sm border px-2 py-1.5 text-xs transition-colors",
                filters.family.has(family)
                  ? "border-champagne bg-champagne/10 font-medium text-charcoal-deep"
                  : "border-border hover:border-accent"
              )}
            >
              {family}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Brand">
        {brands.map((brand) => (
          <ToggleRow
            key={brand}
            label={brand}
            checked={filters.brand.has(brand)}
            onChange={() => toggleSet("brand", brand)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Size">
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSet("size", size)}
              className={cn(
                "rounded-sm border px-2.5 py-1.5 text-xs transition-colors",
                filters.size.has(size)
                  ? "border-champagne bg-champagne/10 font-medium text-charcoal-deep"
                  : "border-border hover:border-accent"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price">
        <div className="space-y-1">
          {priceRanges.map((range) => {
            const selected =
              filters.minPrice === range.min &&
              (range.max === undefined ? filters.maxPrice == null : filters.maxPrice === range.max);
            return (
              <ToggleRow
                key={range.label}
                label={range.label}
                checked={selected}
                onChange={() => {
                  if (selected) {
                    onChange({ ...filters, minPrice: undefined, maxPrice: undefined });
                  } else {
                    onChange({ ...filters, minPrice: range.min, maxPrice: range.max });
                  }
                }}
              />
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Rating">
        <div className="space-y-1">
          {[4, 3, 2].map((r) => (
            <ToggleRow
              key={r}
              label={`${r}★ & above`}
              checked={filters.rating === r}
              onChange={() => onChange({ ...filters, rating: filters.rating === r ? undefined : r })}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Availability" defaultOpen={false}>
        <ToggleRow
          label="In stock only"
          checked={filters.availability === "in_stock"}
          onChange={(checked) => onChange({ ...filters, availability: checked ? "in_stock" : "all" })}
        />
      </FilterSection>
    </div>
  );
}