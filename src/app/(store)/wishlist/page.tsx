import type { Metadata } from "next";
import { getProducts } from "@/lib/data-access/store";
import { WishlistClient } from "@/components/wishlist-client";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "Your saved fragrances at ÉLANÉ — the scents you love, kept in one place.",
};

export default async function WishlistPage() {
  // Pull the full catalog once so the client can resolve saved snapshots to
  // live product data (prices, availability, variants) for "move to cart".
  const products = await getProducts({});
  return <WishlistClient products={products} />;
}