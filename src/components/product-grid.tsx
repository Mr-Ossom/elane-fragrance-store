import type { Product } from "@/types";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  className?: string;
  priorityFirst?: number;
}

export function ProductGrid({ products, className, priorityFirst = 0 }: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < priorityFirst} />
      ))}
    </div>
  );
}