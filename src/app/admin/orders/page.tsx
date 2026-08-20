import type { Metadata } from "next";
import Link from "next/link";
import { getOrdersAdmin } from "@/lib/data-access/admin-store";
import { OrdersAdminClient, type AdminOrderRow } from "@/components/admin/orders-admin-client";

export const metadata: Metadata = {
  title: "Orders",
};

export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;

export default async function AdminOrdersPage() {
  const orders = (await getOrdersAdmin()) as Row[];
  const rows: AdminOrderRow[] = orders.map((o) => ({
    id: String(o.id),
    orderNumber: String(o.order_number),
    customerName: String(o.customer_name),
    customerEmail: String(o.customer_email),
    total: Number(o.total),
    paymentStatus: String(o.payment_status),
    orderStatus: String(o.order_status) as AdminOrderRow["orderStatus"],
    createdAt: String(o.created_at),
    items: ((o.items as Row[]) ?? []).map((it) => ({
      product_name: String(it.product_name ?? ""),
      quantity: Number(it.quantity ?? 0),
      size: String(it.size ?? ""),
    })),
  }));

  return (
    <div>
      <h1 className="text-2xl font-serif font-semibold">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">{rows.length} order(s)</p>
      <div className="mt-5">
        <OrdersAdminClient orders={rows} />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Tip:{" "}
        <Link href="/shop" className="underline">
          paid orders move to “payment_confirmed” automatically via the Paystack webhook
        </Link>
        .
      </p>
    </div>
  );
}