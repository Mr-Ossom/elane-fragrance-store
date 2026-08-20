import type { Metadata } from "next";
import Link from "next/link";
import { getProductsAdminList } from "@/lib/data-access/admin-store";
import { ProductsAdminClient } from "@/components/admin/products-admin-client";

export const metadata: Metadata = {
  title: "Products",
};

export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;

export default async function AdminProductsPage() {
  const products = (await getProductsAdminList()) as Row[];
  const rows = products.map((p) => ({
    id: String(p.id),
    name: String(p.name),
    slug: String(p.slug),
    brand: String(p.brand),
    minPrice: Number(p.min_price ?? 0),
    featured: Boolean(p.featured),
    bestseller: Boolean(p.bestseller),
    newArrival: Boolean(p.new_arrival),
    variants: ((p.variants as Row[]) ?? []).map((v) => Number(v.stock ?? 0)),
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{rows.length} product(s)</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-espresso"
        >
          + New Product
        </Link>
      </div>
      <div className="mt-5">
        <ProductsAdminClient products={rows} />
      </div>
    </div>
  );
}