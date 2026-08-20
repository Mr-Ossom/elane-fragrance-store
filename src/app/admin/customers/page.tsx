import type { Metadata } from "next";
import { getCustomersAdmin } from "@/lib/data-access/admin-store";
import { formatPrice, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Customers",
};

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await getCustomersAdmin();
  return (
    <div>
      <h1 className="text-2xl font-serif font-semibold">Customers</h1>
      <p className="mt-1 text-sm text-muted-foreground">{customers.length} customer(s)</p>
      <div className="mt-5 overflow-x-auto rounded-sm border border-border bg-background">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Spent</th>
              <th className="px-4 py-3">Last order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c, i) => (
              <tr key={i}>
                <td className="px-4 py-3 font-medium">{c.name || "—"}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">{c.phone || "—"}</td>
                <td className="px-4 py-3">{c.orders}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(c.spent)}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.lastOrderAt ? formatDate(c.lastOrderAt) : "—"}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}