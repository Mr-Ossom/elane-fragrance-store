import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoriesSupabase } from "@/lib/data-access/supabase-store";
import { getProductEditorAdmin } from "@/lib/data-access/admin-store";
import { ProductEditor } from "@/components/admin/product-editor";

export const metadata: Metadata = {
  title: "Edit Product",
};

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const [product, categories] = await Promise.all([getProductEditorAdmin(productId), getCategoriesSupabase()]);
  if (!product) notFound();
  return <ProductEditor product={product} categories={categories} />;
}