"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { adminUpdateStock } from "@/app/actions/admin";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface InventoryRow {
  id: string;
  name: string;
  brand: string;
  slug: string;
  variants: { id: string; size: string; price: number; salePrice: number | null; stock: number }[];
}

export function InventoryAdminClient({ rows }: { rows: InventoryRow[] }) {
  const [saving, setSaving] = React.useState<string | null>(null);

  async function save(variantId: string, stock: number) {
    setSaving(variantId);
    await adminUpdateStock({ variantId, stock });
    setSaving(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-semibold">Inventory</h1>
        <p className="text-sm text-muted-foreground">{rows.length} product(s)</p>
      </div>
      <div className="mt-5 overflow-x-auto rounded-sm border border-border bg-background">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Variant</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((p) => (
              <React.Fragment key={p.id}>
                <tr className="bg-secondary/30">
                  <td colSpan={5} className="px-4 py-2.5 font-medium">
                    <Link href={`/products/${p.slug}`} className="hover:text-champagne-deep">
                      {p.name}
                    </Link>
                    <span className="ml-2 text-xs font-normal text-muted-foreground">{p.brand}</span>
                  </td>
                </tr>
                {p.variants.map((v) => {
                  const low = v.stock <= 10;
                  return (
                    <tr key={v.id}>
                      <td></td>
                      <td className="px-4 py-2.5">{v.size}</td>
                      <td className="px-4 py-2.5">
                        {formatPrice(v.salePrice ?? v.price)}
                        {v.salePrice != null && (
                          <span className="ml-2 text-xs text-muted-foreground line-through">{formatPrice(v.price)}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <StockEditor
                          defaultValue={v.stock}
                          saving={saving === v.id}
                          onSave={(stock) => save(v.id, stock)}
                          low={low}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs">
                        {low && <span className="text-amber-600">Low</span>}
                        {v.stock === 0 && <span className="text-destructive">Out of stock</span>}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No products yet. Run <span className="font-mono">npm run db:seed</span> after configuring Supabase.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockEditor({
  defaultValue,
  saving,
  onSave,
  low,
}: {
  defaultValue: number;
  saving: boolean;
  onSave: (stock: number) => void;
  low: boolean;
}) {
  const [value, setValue] = React.useState(String(defaultValue));
  const dirty = Number(value) !== defaultValue;

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={cn(
          "w-20 rounded-sm border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-champagne-deep",
          low && "border-amber-300"
        )}
      />
      {dirty && !saving && (
        <button
          type="button"
          onClick={() => onSave(Math.max(0, Math.floor(Number(value) || 0)))}
          className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground"
          aria-label="Save stock"
        >
          <Check size={13} />
        </button>
      )}
      {saving && <Loader2 size={13} className="animate-spin text-muted-foreground" />}
    </div>
  );
}