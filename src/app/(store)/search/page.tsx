import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchPageClient } from "@/components/search-page-client";

export const metadata: Metadata = {
  title: "Search Fragrances",
  description: "Search the ÉLANÉ collection by name, brand, category or fragrance note.",
};

export default async function SearchPage() {
  return (
    <Suspense fallback={<div className="container-site py-24 text-center text-muted-foreground">Searching…</div>}>
      <SearchPageClient />
    </Suspense>
  );
}