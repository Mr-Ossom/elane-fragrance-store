"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/search", icon: Search, action: true },
  { name: "Wishlist", href: "/wishlist", icon: Heart },
  { name: "Account", href: "/account", icon: User },
];

export function MobileNav() {
  const { count, openCart } = useCart();
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
    >
      <div className="grid h-14 grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          if (tab.action) {
            return (
              <Link
                key={tab.name}
                href={tab.href}
                aria-label={tab.name}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground transition-colors",
                  pathname.startsWith("/search") && "text-champagne-deep"
                )}
              >
                <Icon size={20} strokeWidth={1.75} />
                {tab.name}
              </Link>
            );
          }
          return (
            <Link
              key={tab.name}
              href={tab.href}
              aria-label={tab.name}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground transition-colors",
                active && "text-champagne-deep"
              )}
            >
              <Icon size={20} strokeWidth={1.75} />
              {tab.name}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={openCart}
          aria-label={`Open cart, ${count} items`}
          className="relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground"
        >
          <ShoppingBag size={20} strokeWidth={1.75} />
          {count > 0 && (
            <span className="absolute right-[calc(50%-18px)] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne px-1 text-[9px] font-semibold text-charcoal-deep">
              {count > 99 ? "99+" : count}
            </span>
          )}
          Bag
        </button>
      </div>
    </nav>
  );
}