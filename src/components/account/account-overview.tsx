"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  History,
  LogOut,
  MapPin,
  Package,
  Save,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import type { Order } from "@/types";
import { formatPrice, formatDate } from "@/lib/format";
import { signOutAction, updateProfileAction } from "@/app/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AccountOverviewProps {
  user: { id: string; email: string; fullName: string };
  orders: Order[];
  role?: string;
}

const orderStatusLabels: Record<Order["orderStatus"], string> = {
  pending: "Pending",
  payment_confirmed: "Payment Confirmed",
  processing: "Processing",
  ready_for_delivery: "Ready for Delivery",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function AccountOverview({ user, orders, role }: AccountOverviewProps) {
  const router = useRouter();
  const [fullName, setFullName] = React.useState(user.fullName);
  const [phone, setPhone] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"overview" | "orders" | "settings">("overview");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ ok: boolean; text: string } | null>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const result = await updateProfileAction({ fullName, phone });
    setSaving(false);
    if (result.ok) {
      setMessage({ ok: true, text: "Profile updated." });
    } else {
      setMessage({ ok: false, text: result.error });
    }
  }

  async function handleSignOut() {
    await signOutAction();
    router.push("/");
    router.refresh();
  }

  const recentOrders = orders.slice(0, 4);
  const delivered = orders.filter((o) => o.orderStatus === "delivered").length;

  const nav = [
    { id: "overview" as const, label: "Overview", icon: UserRound },
    { id: "orders" as const, label: "Orders", icon: History },
    { id: "settings" as const, label: "Profile", icon: UserRound },
  ];

  return (
    <div className="container-site grid gap-8 py-8 lg:grid-cols-[240px_1fr]">
      <aside>
        <div className="sticky top-28 space-y-6">
          <div>
            <p className="font-serif text-2xl font-semibold">{user.fullName || "My Account"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <nav aria-label="Account navigation" className="flex flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm transition-colors",
                    activeTab === item.id
                      ? "bg-primary font-medium text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  {item.label}
                  {item.id === "orders" && orders.length > 0 && (
                    <span className="ml-auto text-xs opacity-70">({orders.length})</span>
                  )}
                </button>
              );
            })}
            <Link
              href="/wishlist"
              className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Heart size={16} strokeWidth={1.5} />
              Wishlist
            </Link>
            <Link
              href="/wishlist"
              className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <MapPin size={16} strokeWidth={1.5} />
              Addresses
            </Link>
            {role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm text-champagne-deep transition-colors hover:bg-secondary"
              >
                <ShieldCheck size={16} strokeWidth={1.5} />
                Admin
              </Link>
            )}
            {isSupabaseConfigured && (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
              >
                <LogOut size={16} strokeWidth={1.5} />
                Sign out
              </button>
            )}
          </nav>
        </div>
      </aside>

      <div>
        {activeTab === "overview" && (
          <div>
            <h1 className="text-3xl">Welcome back{user.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}</h1>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Total orders", value: String(orders.length) },
                { label: "Delivered", value: String(delivered) },
                { label: "In progress", value: String(orders.filter((o) => o.orderStatus !== "delivered" && o.orderStatus !== "cancelled").length) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-sm border border-border bg-card p-5">
                  <p className="text-3xl font-serif font-semibold">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl">Recent orders</h2>
                {orders.length > 0 && (
                  <button type="button" onClick={() => setActiveTab("orders")} className="text-sm text-champagne-deep hover:underline">
                    View all
                  </button>
                )}
              </div>
              {recentOrders.length === 0 ? (
                <div className="mt-4 rounded-sm border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No orders yet. <Link href="/shop" className="text-champagne-deep hover:underline">Start shopping</Link>
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-border rounded-sm border border-border bg-card">
                  {recentOrders.map((order) => (
                    <li key={order.id}>
                      <Link href={`/account/orders/${order.id}`} className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-secondary/50">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-secondary text-champagne-deep">
                            <Package size={18} strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(order.createdAt)} · {order.items.length} item{order.items.length === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(order.total)}</p>
                          <Badge variant={order.orderStatus === "cancelled" ? "destructive" : order.orderStatus === "delivered" ? "success" : "outline"}>
                            {orderStatusLabels[order.orderStatus]}
                          </Badge>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h1 className="text-3xl">Your orders</h1>
            {orders.length === 0 ? (
              <div className="mt-6 rounded-sm border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                <Star size={22} className="mx-auto mb-2 opacity-40" />
                No orders yet. <Link href="/shop" className="text-champagne-deep hover:underline">Find your signature scent</Link>
              </div>
            ) : (
              <ul className="mt-6 space-y-3">
                {orders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-card p-5 transition-colors hover:border-champagne/50"
                    >
                      <div>
                        <p className="font-serif text-lg font-semibold">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)} · {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{formatPrice(order.total)}</span>
                        <Badge variant={order.orderStatus === "cancelled" ? "destructive" : order.orderStatus === "delivered" ? "success" : "outline"}>
                          {orderStatusLabels[order.orderStatus]}
                        </Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <h1 className="text-3xl">Profile</h1>
            <form onSubmit={saveProfile} className="mt-6 max-w-md space-y-4">
              <div>
                <Label htmlFor="acct-name">Full name</Label>
                <Input id="acct-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="acct-phone">Phone</Label>
                <Input id="acct-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="024 000 0000" />
              </div>
              <div>
                <Label htmlFor="acct-email">Email</Label>
                <Input id="acct-email" value={user.email} disabled className="opacity-70" />
              </div>
              {message && (
                <p className={cn("rounded-sm border p-3 text-sm", message.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-destructive/40 bg-destructive/10 text-destructive")}>
                  {message.text}
                </p>
              )}
              <Button type="submit" disabled={saving} className="gap-2">
                <Save size={15} />
                {saving ? "Saving…" : "Save Changes"}
              </Button>
              <div className="pt-2">
                <Link href="/account/password" className="text-sm text-champagne-deep hover:underline">
                  Change password
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}