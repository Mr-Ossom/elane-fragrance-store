import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-charcoal-deep text-ivory">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2560&auto=format&fit=crop"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep via-charcoal-deep/70 to-charcoal-deep/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep via-transparent to-charcoal-deep/40" />
      </div>

      <div className="container-site relative flex min-h-[80svh] flex-col justify-center py-20 sm:min-h-[86svh]">
        <p className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.28em] text-champagne-light">
          <Sparkles size={13} strokeWidth={1.5} />
          Fragrance House Ghana
        </p>
        <h1 className="max-w-2xl text-balance text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
          Your Signature
          <br />
          Scent <span className="italic text-champagne-light">Awaits.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/80 sm:text-lg">
          Discover premium fragrances, body colognes and perfume oils curated for
          every occasion — delivered to your door anywhere in Ghana.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" variant="accent">
            <Link href="/shop">
              Shop Collection
              <ArrowRight size={15} strokeWidth={1.75} />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10"
          >
            <Link href="/shop?sort=bestSelling">Explore Best Sellers</Link>
          </Button>
        </div>

        <div className="mt-14 grid max-w-2xl grid-cols-3 gap-4 text-sm">
          {[
            ["100%", "Authentic fragrances"],
            ["16", "Regions delivered"],
            ["24h", "Fast dispatch"],
          ].map(([value, label]) => (
            <div key={label} className="border-t border-ivory/15 pt-3">
              <p className="font-serif text-2xl text-champagne-light">{value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-ivory/60">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}