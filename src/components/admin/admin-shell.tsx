"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LogOut,
  MapPin,
  Package,
  Tags,
  TicketPercent,
  Users,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/admin/reviews", label: "Reviews", icon: Tags },
  { href: "/admin/delivery", label: "Delivery", icon: MapPin },
];

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOutAction();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-background md:flex">
          <div className="border-b border-border p-5">
            <Link href="/admin" className="font-serif text-xl font-semibold">
              ÉLANÉ <span className="text-xs font-normal uppercase tracking-widest text-muted-foreground">Admin</span>
            </Link>
            <p className="mt-1 truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <nav aria-label="Admin navigation" className="flex flex-1 flex-col gap-1 p-3">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-primary font-medium text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-3">
            <Link href="/" className="mb-1 flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
              ← View storefront
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-destructive"
            >
              <LogOut size={16} strokeWidth={1.5} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Mobile header */}
          <div className="flex items-center justify-between border-b border-border bg-background p-4 md:hidden">
            <span className="font-serif text-lg font-semibold">ÉLANÉ Admin</span>
            <nav className="flex gap-0.5 overflow-x-auto text-xs">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-sm px-2 py-1.5",
                    pathname.startsWith(item.href) ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <main className="p-4 sm:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}