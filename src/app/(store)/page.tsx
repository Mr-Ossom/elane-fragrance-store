import type { Metadata } from "next";
import { getCategories, getDeliveryZones, getProducts, getReviews } from "@/lib/data-access/store";
import { HeroSection } from "@/components/home/hero-section";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { ProductRowSection } from "@/components/home/product-row-section";
import { FragrancePreference } from "@/components/home/fragrance-preference";
import { LuxuryBanner } from "@/components/home/luxury-banner";
import { WhyShopWithUs } from "@/components/home/why-shop-with-us";
import { CustomerReviews } from "@/components/home/customer-reviews";
import { GhanaDelivery } from "@/components/home/ghana-delivery";

export const metadata: Metadata = {
  title: "Premium Fragrances, Body Colognes & Perfume Oils in Ghana",
  description:
    "Discover premium perfumes, body colognes and perfume oils curated for every occasion. Same-day delivery across Accra, Tema and nationwide across Ghana.",
  openGraph: {
    title: "ÉLANÉ — Your Signature Scent Awaits.",
    description:
      "Shop authentic fragrances — Lattafa, Armaf, Afnan & ÉLANÉ house oils. Delivered across Ghana.",
    images: [{ url: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1600&auto=format&fit=crop" }],
  },
};

export default async function HomePage() {
  const [categories, bestsellers, newArrivals, reviews, zones] = await Promise.all([
    getCategories(),
    getProducts({ sort: "bestSelling", limit: 8 }),
    getProducts({ newArrival: true, sort: "newest", limit: 4 }),
    getReviews(),
    getDeliveryZones(),
  ]);

  return (
    <>
      <HeroSection />
      <CategoryShowcase categories={categories} />
      <ProductRowSection
        eyebrow="Customer Favourites"
        title="Best Sellers"
        description="The fragrances Ghana keeps coming back for."
        products={bestsellers}
        viewAllHref="/shop?sort=bestSelling"
        viewAllLabel="Shop Best Sellers"
      />
      <FragrancePreference />
      <LuxuryBanner />
      <ProductRowSection
        eyebrow="Just Landed"
        title="New Arrivals"
        products={newArrivals}
        viewAllHref="/shop?sort=newest"
        viewAllLabel="Shop New Arrivals"
        className="border-t border-border bg-secondary/30"
      />
      <WhyShopWithUs />
      <CustomerReviews reviews={reviews} />
      <GhanaDelivery zones={zones} />
    </>
  );
}