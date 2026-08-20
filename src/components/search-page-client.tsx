"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { ProductGrid } from "@/components/product-grid";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";

export function SearchPageClient() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [query] = React.useState(initial);
  const [results, setResults] = React.useState<import("@/types").Product[]>([]);
  const [loading, setLoading] = React.useState(Boolean(initial));
  const [hasSearched, setHasSearched] = React.useState(Boolean(initial));

  // Keep the SearchBar in sync with the URL-driven term once
  const debounced = useDebouncedValue(query, 300);

  React.useEffect(() => {
    if (!debounced.trim()) {
      // Sync reset when the debounced query is empty.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
       
      setHasSearched(false);
       
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debounced.trim())}&limit=24`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setResults(data.products ?? []);
        setHasSearched(true);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <div className="container-site py-8">
      <h1 className="text-3xl sm:text-4xl">Search</h1>
      <p className="mt-2 text-muted-foreground">
        Find your next signature scent by name, brand, category or fragrance note.
      </p>

      <div className="mt-6 max-w-xl">
        <SearchBar
          autoFocus
          className=""
          onClose={() => undefined}
        />
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="mt-3 h-3 w-16" />
                <Skeleton className="mt-2 h-5 w-24" />
              </div>
            ))}
          </div>
        ) : hasSearched && results.length === 0 ? (
          <EmptyState
            icon={<Search size={24} />}
            title="No results found"
            description="Try a different spelling, or search for ‘oud’, ‘vanilla’ or a brand like ‘Lattafa’."
          />
        ) : hasSearched ? (
          <div>
            <p className="mb-6 text-sm text-muted-foreground">
              {results.length} result{results.length === 1 ? "" : "s"} for “{debounced.trim()}”
            </p>
            <ProductGrid products={results} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Try searching for “oud”, “vanilla”, “Lattafa”, “100ml” or a fragrance family like “Fresh”.
          </p>
        )}
      </div>
    </div>
  );
}