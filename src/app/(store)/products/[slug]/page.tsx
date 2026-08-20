import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getProductBySlug, getProductReviews, getRelatedProducts } from "@/lib/data-access/store";
import { ProductView } from "@/components/products/product-view";
import { ReviewsSection } from "@/components/products/reviews-section";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductRowSection } from "@/components/home/product-row-section";
import { brand, siteUrl } from "@/lib/brand";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Fragrance not found" };
  const minPrice = Math.min(...product.variants.map((v) => v.salePrice ?? v.price));
  return {
    title: `${product.name} by ${product.brand} — from ${brand.currencySymbol}${minPrice}`,
    description: product.description.slice(0, 156),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      url: `${siteUrl}/products/${product.slug}`,
      title: `${product.name} by ${product.brand}`,
      description: product.description.slice(0, 156),
      images: product.images[0]
        ? [{ url: product.images[0].url, alt: product.images[0].alt || product.name }]
        : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, related] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts(product, 4),
  ]);

  const cheapest = product.variants.reduce(
    (min, v) => Math.min(min, v.salePrice ?? v.price),
    Infinity
  );
  const imageUrl = product.images[0]?.url
    ? new URL(product.images[0].url, siteUrl).toString()
    : undefined;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${product.name}`,
    Brand: {
      "@type": "Brand",
      name: product.brand,
    },
    description: product.description,
    sku: product.variants[0]?.sku,
    image: imageUrl,
    category: product.categoryName,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "GHS",
      lowPrice: cheapest,
      highPrice: Math.max(...product.variants.map((v) => v.price)),
      offerCount: product.variants.length,
      availability: product.variants.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteUrl}/products/${product.slug}`,
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };

  const crumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${siteUrl}/shop` },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${siteUrl}/products/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <Script id="product-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <Script id="crumbs-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbsJsonLd) }} />

      <div className="container-site py-6 sm:py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: product.categoryName, href: `/categories/${product.categorySlug}` },
            { label: product.name },
          ]}
        />
        <ProductView product={product} />
        <ReviewsSection
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
          reviews={reviews}
        />
      </div>

      {related.length > 0 && (
        <ProductRowSection
          eyebrow="You May Also Like"
          title="Complete Your Collection"
          products={related}
          className="border-t border-border bg-secondary/30"
        />
      )}
    </>
  );
}