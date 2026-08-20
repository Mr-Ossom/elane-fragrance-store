import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { SectionHeading } from "@/components/section-heading";
import { ProductCard } from "@/components/product-card";

interface ProductRowSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
}

export function ProductRowSection({
  eyebrow,
  title,
  description,
  products,
  viewAllHref,
  viewAllLabel = "View All",
  className,
}: ProductRowSectionProps) {
  return (
    <section className={className}>
      <div className="container-site py-16 sm:py-20">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 2} />
          ))}
        </div>
        {viewAllHref && (
          <div className="mt-10 text-center">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 border-b border-border pb-1 text-sm font-medium uppercase tracking-widest transition-colors hover:border-champagne hover:text-champagne-deep"
            >
              {viewAllLabel}
              <ArrowRight size={14} strokeWidth={1.75} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}