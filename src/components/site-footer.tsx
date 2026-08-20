import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck, Truck } from "lucide-react";
import { brand } from "@/lib/brand";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v3H8v7h3.5v-7h2.25L14 13h1.75v2.25A2 2 0 0 0 17.75 17.5H20v-4.5h-3V7.5A4.5 4.5 0 0 0 15 3Z" strokeLinejoin="round" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden>
      <path d="M14.5 3v9.75a3.75 3.75 0 1 1-3.75-3.75" transform="translate(0 -1)" />
      <circle cx="17" cy="9" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const collections = [
  { name: "Perfumes", href: "/categories/perfumes" },
  { name: "Body Colognes", href: "/categories/body-colognes" },
  { name: "Perfume Oils", href: "/categories/perfume-oils" },
  { name: "Gift Sets", href: "/categories/gift-sets" },
];

const customerLinks = [
  { name: "Shop All", href: "/shop" },
  { name: "Best Sellers", href: "/shop?sort=bestSelling" },
  { name: "New Arrivals", href: "/shop?sort=newest&flag=newArrival" },
  { name: "Wishlist", href: "/wishlist" },
  { name: "My Orders", href: "/account" },
  { name: "Track Delivery", href: "/track-order" },
];

const helpLinks = [
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Delivery & Shipping", href: "/about#delivery" },
  { name: "Returns", href: "/about#returns" },
  { name: "Privacy Policy", href: "/privacy" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-charcoal-deep pb-24 text-ivory lg:pb-0">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-3xl font-semibold tracking-[0.08em]">{brand.name}</span>
            <span className="font-serif text-[10px] uppercase tracking-[0.26em] text-champagne-light">
              {brand.subtitle}
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory/70">
            {brand.description}
          </p>
          <p className="mt-4 flex max-w-xs items-center gap-2 text-sm text-ivory/70">
            <Truck size={15} className="shrink-0 text-champagne-light" />
            {brand.deliveryNote}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-champagne-light">
            Collections
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/70">
            {collections.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="transition-colors hover:text-champagne-light">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-champagne-light">
            Customer Care
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/70">
            {customerLinks.map((l) => (
              <li key={l.name}>
                <Link href={l.href} className="transition-colors hover:text-champagne-light">
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-champagne-light">
            Get in Touch
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-ivory/70">
            <li className="flex items-center gap-2.5">
              <Phone size={15} className="shrink-0" />
              <a href={`tel:${brand.supportPhone}`} className="hover:text-champagne-light">
                {brand.supportPhoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={15} className="shrink-0" />
              <a href={`mailto:${brand.email}`} className="break-all hover:text-champagne-light">
                {brand.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin size={15} className="shrink-0" />
              {brand.address}
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck size={15} className="shrink-0" />
              {brand.hours}
            </li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            {Object.entries(brand.social).map(([key, url]) => (
              <a
                key={key}
                href={url || undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={key}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/20 text-ivory/70 transition-colors hover:border-champagne-light hover:text-champagne-light"
              >
                {key === "instagram" && <InstagramIcon className="h-4 w-4" />}
                {key === "facebook" && <FacebookIcon className="h-4 w-4" />}
                {key === "tiktok" && <TikTokIcon className="h-4 w-4" />}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-6 text-xs text-ivory/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5">
            {helpLinks.map((l) => (
              <Link key={l.name} href={l.href} className="transition-colors hover:text-champagne-light">
                {l.name}
              </Link>
            ))}
          </div>
          <p className="text-ivory/40">Payments: Mobile Money · Visa · Mastercard</p>
        </div>
      </div>
    </footer>
  );
}