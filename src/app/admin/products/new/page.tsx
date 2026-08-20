import type { Metadata } from "next";
import { getCategoriesSupabase } from "@/lib/data-access/supabase-store";
import { ProductEditor } from "@/components/admin/product-editor";

export const metadata: Metadata = {
  title: "New Product",
};

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const categories = await getCategoriesSupabase();
  return <ProductEditor categories={categories} />;
}