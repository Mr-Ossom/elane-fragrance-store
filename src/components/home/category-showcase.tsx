import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/types";
import { SectionHeading } from "@/components/section-heading";

const genderShortcuts = [
  { name: "Men", slug: "men", accent: "Men's Fragrances" },
  { name: "Women", slug: "women", accent: "Women's Fragrances" },
  { name: "Unisex", slug: "unisex", accent: "For Everyone" },
];

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  return (
    <section className="container-site py-16 sm:py-20">
      <SectionHeading
        eyebrow="Curated Collections"
        title="Shop by Category"
        description="From statement perfumes to concentrated perfume oils — find the format that fits your everyday."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative block aspect-[4/5] overflow-hidden rounded-sm bg-secondary"
          >
            <Image
              src={category.image ?? "/images/products/hero.svg"}
              alt={category.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep/85 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
              <div>
                <h3 className="text-2xl text-ivory">{category.name}</h3>
                <p className="mt-1 max-w-[200px] text-xs text-ivory/70">{category.description}</p>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ivory/30 text-ivory transition-all group-hover:border-champagne-light group-hover:bg-champagne group-hover:text-charcoal-deep">
                <ArrowUpRight size={16} strokeWidth={1.75} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {genderShortcuts.map((g) => (
          <Link
            key={g.slug}
            href={`/shop?gender=${g.slug}`}
            className="group flex items-center justify-between rounded-sm border border-border bg-card px-5 py-4 transition-colors hover:border-champagne/50"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{g.accent}</p>
              <p className="mt-0.5 font-serif text-2xl font-semibold">{g.name}</p>
            </div>
            <ArrowUpRight
              size={18}
              className="text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-champagne-deep"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}