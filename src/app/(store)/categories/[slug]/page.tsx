import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getProducts } from "@/lib/data-access/store";
import { ProductGrid } from "@/components/product-grid";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.name} in Ghana`,
    description: category.description ?? `Shop premium ${category.name.toLowerCase()} at ÉLANÉ — delivered across Ghana.`,
    alternates: { canonical: `/categories/${slug}` },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ category: slug, sort: "featured" }),
  ]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <div className="container-site py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: category.name },
        ]}
      />
      <header className="max-w-2xl py-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-champagne-deep">
          Collection
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl">{category.name}</h1>
        {category.description && (
          <p className="mt-3 text-muted-foreground">{category.description}</p>
        )}
      </header>

      {products.length === 0 ? (
        <EmptyState
          icon={<span className="text-2xl">🫙</span>}
          title="Nothing here yet"
          description="New fragrances are on the way. Explore the full collection in the meantime."
          action={
            <Button asChild>
              <Link href="/shop">Shop All</Link>
            </Button>
          }
        />
      ) : (
        <ProductGrid products={products} className="pb-10" priorityFirst={4} />
      )}
    </div>
  );
}