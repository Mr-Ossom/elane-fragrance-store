import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart-page-client";

export const metadata: Metadata = {
  title: "Your Bag",
  description: "Review the fragrances in your bag and proceed to a secure Ghanaian checkout.",
};

export default function CartPage() {
  return <CartPageClient />;
}