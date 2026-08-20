"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, TrendingUp, X } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Product } from "@/types";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  autoFocus?: boolean;
  onClose?: () => void;
}

export function SearchBar({ className, autoFocus, onClose }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Product[]>([]);
  const [open, setOpen] = React.useState(false);
  const debounced = useDebouncedValue(query, 250);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!debounced.trim()) {
      // Sync reset when the debounced query is empty.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
       
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debounced.trim())}&limit=6`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setSuggestions(data.products ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    track("search_performed", { query: q });
    router.push(`/shop?q=${encodeURIComponent(q)}`);
    setOpen(false);
    onClose?.();
  }

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={submit} role="search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            autoFocus={autoFocus}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search oud, vanilla, Lattafa…"
            aria-label="Search products"
            className="h-11 w-full rounded-sm border border-input bg-card pl-10 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </form>

      {open && (query.trim() || suggestions.length > 0) && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-sm border border-border bg-card shadow-xl">
          {loading ? (
            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.slug}`}
                    onClick={() => {
                      setOpen(false);
                      onClose?.();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-secondary"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-secondary">
                      <Image src={p.images[0]?.url ?? "/images/products/hero.svg"} alt={p.name} fill sizes="40px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.brand}</p>
                    </div>
                  </Link>
                </li>
              ))}
              <li className="border-t border-border">
                <button
                  type="button"
                  onClick={submit}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-champagne-deep transition-colors hover:bg-secondary"
                >
                  <Search size={14} />
                  View all results for “{query.trim()}”
                </button>
              </li>
            </ul>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
                <TrendingUp size={14} /> Popular right now
              </div>
              <div className="flex flex-wrap gap-2">
                {["Oud", "Vanilla", "Lattafa", "Perfume Oil", "9PM"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      router.push(`/shop?q=${encodeURIComponent(term)}`);
                      setOpen(false);
                      onClose?.();
                    }}
                    className="rounded-full border border-border px-3 py-1 text-xs transition-colors hover:border-accent hover:text-champagne-deep"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}