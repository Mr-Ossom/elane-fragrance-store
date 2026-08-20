"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { adminDeleteProduct } from "@/app/actions/admin";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  brand: string;
  minPrice: number;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  variants: number[];
}

export function ProductsAdminClient({ products }: { products: AdminProductRow[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  async function remove(product: AdminProductRow) {
    if (!confirm(`Delete "${product.name}"? This also removes its variants, images and reviews.`)) return;
    setDeleting(product.id);
    setError("");
    const result = await adminDeleteProduct(product.id);
    setDeleting(null);
    if (!result.ok) {
      setError(result.error ?? "Failed to delete product");
      return;
    }
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border bg-background">
      {error && (
        <p className="border-b border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Brand</th>
            <th className="px-4 py-3">From</th>
            <th className="px-4 py-3">Flags</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((p) => {
            const totalStock = p.variants.reduce((s, n) => s + n, 0);
            const out = totalStock === 0;
            return (
              <tr key={p.id} className="align-middle">
                <td className="px-4 py-3">
                  <Link href={`/products/${p.slug}`} className="font-medium hover:text-champagne-deep">
                    {p.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">/{p.slug}</div>
                </td>
                <td className="px-4 py-3">{p.brand}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(p.minPrice)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.featured && <Badge variant="accent">Featured</Badge>}
                    {p.bestseller && <Badge variant="outline">Best seller</Badge>}
                    {p.newArrival && <Badge variant="outline">New</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("font-medium", out && "text-destructive", totalStock > 0 && totalStock <= 10 && "text-amber-600")}>
                    {totalStock}
                  </span>
                  <span className="text-xs text-muted-foreground"> across {p.variants.length} variant(s)</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="inline-flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 text-xs hover:bg-secondary"
                    >
                      <Pencil size={13} /> Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(p)}
                      disabled={deleting === p.id}
                      className="inline-flex items-center gap-1 rounded-sm border border-destructive/40 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      {deleting === p.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center">
                <PlusCircle size={22} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">No products yet.</p>
                <Link href="/admin/products/new" className="mt-2 inline-block text-sm text-champagne-deep hover:underline">
                  Create your first product
                </Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}