"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { ORDER_STATUSES } from "@/lib/order-status";
import { adminUpdateOrderStatus } from "@/app/actions/admin";
import { orderStatusLabel } from "@/lib/order-status";
import { formatPrice, formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentStatus: string;
  orderStatus: never;
  createdAt: string;
  items: { product_name: string; quantity: number; size: string }[];
}

export function OrdersAdminClient({ orders }: { orders: AdminOrderRow[] }) {
  const [updating, setUpdating] = React.useState<string | null>(null);

  async function change(orderId: string, status: never) {
    setUpdating(orderId);
    await adminUpdateOrderStatus(orderId, status);
    setUpdating(null);
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border bg-background">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Items</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Payment</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Placed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => (
            <tr key={order.id} className="align-middle">
              <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
              <td className="px-4 py-3">
                <div>{order.customerName}</div>
                <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
              </td>
              <td className="px-4 py-3">
                {order.items.slice(0, 2).map((item, i) => (
                  <div key={i} className="text-xs text-muted-foreground">
                    {item.quantity} × {item.product_name} ({item.size})
                  </div>
                ))}
                {order.items.length > 2 && (
                  <div className="text-xs text-muted-foreground">+{order.items.length - 2} more</div>
                )}
              </td>
              <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
              <td className="px-4 py-3">
                <Badge
                  variant={
                    order.paymentStatus === "paid"
                      ? "success"
                      : order.paymentStatus === "failed" || order.paymentStatus === "cancelled"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="relative inline-block">
                  <select
                    value={(order.orderStatus as string) ?? "pending"}
                    disabled={updating === order.id}
                    onChange={(e) => change(order.id, e.target.value as never)}
                    className={cn(
                      "appearance-none rounded-sm border bg-background px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-champagne-deep",
                      updating === order.id && "opacity-60"
                    )}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {orderStatusLabel(s)}
                      </option>
                    ))}
                  </select>
                  {updating === order.id && (
                    <Loader2 size={13} className="pointer-events-none absolute right-2.5 top-2.5 animate-spin text-muted-foreground" />
                  )}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDateTime(order.createdAt)}</td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                No orders yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}