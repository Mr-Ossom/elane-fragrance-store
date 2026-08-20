"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { SortOption } from "@/types";
import { cn } from "@/lib/utils";

const options: Array<{ value: SortOption; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "bestSelling", label: "Best Selling" },
  { value: "priceLowHigh", label: "Price: Low to High" },
  { value: "priceHighLow", label: "Price: High to Low" },
  { value: "highestRated", label: "Highest Rated" },
];

export function SortSelect({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (value: SortOption) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 items-center gap-2 rounded-sm border border-border bg-card px-3 text-sm transition-colors hover:border-accent",
          open && "border-accent"
        )}
      >
        Sort: <span className="font-medium">{current?.label ?? "Featured"}</span>
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Sort products"
          className="absolute right-0 top-full z-50 mt-1.5 max-h-[60vh] w-56 overflow-y-auto rounded-sm border border-border bg-card py-1 shadow-xl"
        >
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={value === option.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                  value === option.value && "font-medium text-champagne-deep"
                )}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}