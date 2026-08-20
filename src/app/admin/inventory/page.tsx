import type { Metadata } from "next";
import { getInventoryAdmin } from "@/lib/data-access/admin-store";
import { InventoryAdminClient } from "@/components/admin/inventory-admin-client";

export const metadata: Metadata = {
  title: "Inventory",
};

export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;

export default async function AdminInventoryPage() {
  const inventory = (await getInventoryAdmin()) as Row[];
  const rows = inventory.map((p) => ({
    id: String(p.id),
    name: String(p.name),
    brand: String(p.brand),
    slug: String(p.slug),
    variants: ((p.variants as Row[]) ?? []).map((v) => ({
      id: String(v.id),
      size: String(v.size),
      price: Number(v.price),
      salePrice: v.sale_price == null ? null : Number(v.sale_price),
      stock: Number(v.stock),
    })),
  }));
  return <InventoryAdminClient rows={rows} />;
}