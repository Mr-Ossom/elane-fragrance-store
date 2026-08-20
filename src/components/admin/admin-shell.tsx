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
  Menu,
  Package,
  Tags,
  TicketPercent,
  Users,
  X,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
  const [menuOpen, setMenuOpen] = React.useState(false);

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
          <div className="flex items-center justify-between gap-2 border-b border-border bg-background p-4 md:hidden">
            <button
              type="button"
              aria-label="Open admin menu"
              onClick={() => setMenuOpen(true)}
              className="rounded-sm p-1.5 hover:bg-secondary"
            >
              <Menu size={20} strokeWidth={1.75} />
            </button>
            <span className="min-w-0 truncate font-serif text-lg font-semibold">ÉLANÉ Admin</span>
            <button
              type="button"
              aria-label="Sign out"
              onClick={handleSignOut}
              className="rounded-sm p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"
            >
              <LogOut size={18} strokeWidth={1.75} />
            </button>
          </div>

          {/* Mobile menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetContent side="left">
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle>
                      ÉLANÉ <span className="text-xs font-normal uppercase tracking-widest text-muted-foreground">Admin</span>
                    </SheetTitle>
                    <p className="mt-1 max-w-[220px] truncate text-xs text-muted-foreground">{email}</p>
                  </div>
                  <SheetClose className="rounded-sm p-1 text-muted-foreground hover:text-foreground">
                    <X size={18} />
                    <span className="sr-only">Close menu</span>
                  </SheetClose>
                </div>
              </SheetHeader>
              <SheetBody>
                <nav aria-label="Admin navigation" className="flex flex-col gap-1 px-2 py-2">
                  {nav.map((item) => {
                    const Icon = item.icon;
                    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
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
                      </SheetClose>
                    );
                  })}
                </nav>
              </SheetBody>
              <SheetFooter>
                <div className="flex flex-col gap-1">
                  <SheetClose asChild>
                    <Link
                      href="/"
                      className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      ← View storefront
                    </Link>
                  </SheetClose>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-destructive"
                  >
                    <LogOut size={16} strokeWidth={1.5} />
                    Sign out
                  </button>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <main className="p-4 sm:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}