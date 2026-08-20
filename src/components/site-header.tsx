"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  Store,
  Truck,
  User,
  X,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SearchBar } from "@/components/search-bar";

const categories = [
  { name: "Perfumes", slug: "perfumes" },
  { name: "Body Colognes", slug: "body-colognes" },
  { name: "Perfume Oils", slug: "perfume-oils" },
  { name: "Gift Sets", slug: "gift-sets" },
];

const navLinks = [
  { name: "Shop", href: "/shop" },
  { name: "Men", href: "/shop?gender=men" },
  { name: "Women", href: "/shop?gender=women" },
  { name: "Unisex", href: "/shop?gender=unisex" },
  { name: "Best Sellers", href: "/shop?sort=bestSelling" },
  { name: "New Arrivals", href: "/shop?sort=newest&flag=newArrival" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const { count, openCart } = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  const isActive = (href: string) => {
    const url = href.split("?")[0];
    if (url === "/shop" && pathname.startsWith("/shop")) return true;
    return pathname === url;
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="bg-charcoal-deep text-ivory">
        <div className="container-site flex h-9 items-center justify-center gap-2 px-4 text-[11px] font-medium uppercase tracking-[0.14em] sm:justify-between sm:px-6">
          <span className="hidden items-center gap-1.5 sm:flex">
            <Truck size={13} strokeWidth={1.5} />
            Same-day delivery in Accra &amp; Tema
          </span>
          <span className="flex items-center gap-1.5">
            <Phone size={13} strokeWidth={1.5} />
            {brand.supportPhoneDisplay}
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <Store size={13} strokeWidth={1.5} />
            Authentic · Verified · Delivered across Ghana
          </span>
        </div>
      </div>

      {/* Main header bar */}
      <div className="container-site flex items-center justify-between gap-4 py-3 sm:py-4">
        <button
          type="button"
          className="rounded-sm p-1.5 hover:bg-secondary lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} strokeWidth={1.75} />
        </button>

        <Link href="/" className="flex items-baseline gap-1.5" aria-label={`${brand.name} home`}>
          <span className="font-serif text-2xl font-semibold tracking-[0.08em] text-foreground sm:text-3xl">
            {brand.name}
          </span>
          <span className="hidden font-serif text-[11px] uppercase tracking-[0.26em] text-champagne-deep sm:inline">
            {brand.subtitle}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex">
          <div className="group relative">
            <button
              type="button"
              className={cn(
                "px-1 py-1 text-sm font-medium transition-colors hover:text-champagne-deep",
                pathname.includes("/categories") && "text-champagne-deep"
              )}
            >
              Collections
            </button>
            <div className="invisible absolute left-0 top-full z-40 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100 focus-within:visible focus-within:opacity-100">
              <div className="w-56 rounded-sm border border-border bg-card p-2 shadow-xl">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/categories/${c.slug}`}
                    className="block rounded-sm px-3 py-2 text-sm transition-colors hover:bg-secondary hover:text-champagne-deep"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.href + link.name}
              href={link.href}
              className={cn(
                "px-1 py-1 text-sm font-medium transition-colors hover:text-champagne-deep",
                isActive(link.href) && "text-champagne-deep"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            aria-label="Open search"
            onClick={() => setSearchOpen(true)}
            className="rounded-full p-2 transition-colors hover:bg-secondary"
          >
            <Search size={19} strokeWidth={1.75} />
          </button>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="rounded-full p-2 transition-colors hover:bg-secondary"
          >
            <Heart size={19} strokeWidth={1.75} />
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="rounded-full p-2 transition-colors hover:bg-secondary"
          >
            <User size={19} strokeWidth={1.75} />
          </Link>
          <button
            type="button"
            aria-label={`Open cart, ${count} items`}
            onClick={openCart}
            className="relative rounded-full p-2 transition-colors hover:bg-secondary"
          >
            <ShoppingBag size={19} strokeWidth={1.75} />
            {count > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne px-1 text-[10px] font-semibold text-charcoal-deep">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>{brand.name}</SheetTitle>
              <SheetClose className="rounded-sm p-1 text-muted-foreground hover:text-foreground">
                <X size={18} />
                <span className="sr-only">Close menu</span>
              </SheetClose>
            </div>
          </SheetHeader>
          <SheetBody>
            <nav aria-label="Mobile navigation" className="flex flex-col px-2 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href + link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-sm px-4 py-3 text-base font-medium transition-colors hover:bg-secondary",
                    isActive(link.href) && "text-champagne-deep"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="mt-2 border-t border-border px-4 pt-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Collections
              </p>
              <div className="flex flex-col">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/categories/${c.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-sm px-4 py-2.5 text-sm transition-colors hover:bg-secondary"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </SheetBody>
        </SheetContent>
      </Sheet>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
            <p className="font-serif text-lg font-semibold">Search</p>
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
              className="rounded-full p-2 hover:bg-secondary"
            >
              <X size={20} />
            </button>
          </div>
          <div className="container-site py-6">
            <SearchBar autoFocus onClose={() => setSearchOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}