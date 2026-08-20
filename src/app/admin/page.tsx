import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CircleDollarSign, ShoppingBag, Users } from "lucide-react";
import { getAdminStatsSupabase } from "@/lib/data-access/supabase-store";
import { getOrdersAdmin, getInventoryAdmin } from "@/lib/data-access/admin-store";
import { orderStatusLabel } from "@/lib/order-status";
import { formatPrice, formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;

export default async function AdminDashboardPage() {
  const [stats, orders, inventory] = await Promise.all([
    getAdminStatsSupabase(),
    getOrdersAdmin(),
    getInventoryAdmin(),
  ]);

  const statsCards = [
    { label: "Revenue (paid)", value: formatPrice(stats.revenue), icon: CircleDollarSign },
    { label: "Paid orders", value: String(stats.orders), icon: ShoppingBag },
    { label: "Customers", value: String(stats.customers), icon: Users },
    { label: "Avg. order value", value: formatPrice(stats.averageOrderValue), icon: CircleDollarSign },
  ];

  const lowStock = (inventory as Row[]).filter((p) =>
    ((p.variants as Row[]) ?? []).some((v) => Number(v.stock) >= 0 && Number(v.stock) <= 10)
  );

  const recentOrders = (orders as Row[]).slice(0, 8);

  return (
    <div>
      <h1 className="text-2xl font-serif font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">A live view of your store.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-sm border border-border bg-background p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <Icon size={17} className="text-champagne-deep" strokeWidth={1.5} />
              </div>
              <p className="mt-2 text-2xl font-serif font-semibold">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-sm text-champagne-deep hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-3 overflow-x-auto rounded-sm border border-border bg-background">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((o) => (
                  <tr key={String(o.id)}>
                    <td className="px-4 py-3 font-medium">{String(o.order_number)}</td>
                    <td className="px-4 py-3">
                      <div>{String(o.customer_name)}</div>
                      <div className="text-xs text-muted-foreground">{String(o.customer_email)}</div>
                    </td>
                    <td className="px-4 py-3">{formatPrice(Number(o.total))}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-sm border border-border bg-secondary/50 px-2 py-0.5 text-xs capitalize">
                        {orderStatusLabel(String(o.order_status) as never)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(String(o.created_at))}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold">Inventory alerts</h2>
            <Link href="/admin/inventory" className="flex items-center gap-1 text-sm text-champagne-deep hover:underline">
              Manage <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {lowStock.length === 0 && (
              <div className="rounded-sm border border-border bg-background p-4 text-sm text-muted-foreground">
                All variants are well stocked. ✨
              </div>
            )}
            {lowStock.slice(0, 6).map((p) => (
              <div key={String(p.id)} className="flex items-center justify-between rounded-sm border border-border bg-background p-4 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{String(p.name)}</p>
                  <p className="truncate text-xs text-muted-foreground">{String(p.brand)}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <AlertTriangle size={14} className="text-amber-600" />
                  {Number(((((p.variants as Row[]) ?? []).find((v) => Number(v.stock) <= 10) as Row | undefined)?.stock) ?? 0)} left
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}