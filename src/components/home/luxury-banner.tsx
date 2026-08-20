import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function LuxuryBanner() {
  return (
    <section className="container-site py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-sm bg-charcoal-deep text-ivory">
        <Image
          src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=2560&auto=format&fit=crop"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep via-charcoal-deep/60 to-transparent" />
        <div className="relative max-w-2xl px-6 py-16 sm:px-14 sm:py-24">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-champagne-light">
            The ÉLANÉ Edit
          </p>
          <h2 className="mt-3 text-balance text-4xl leading-tight sm:text-5xl">
            Find the fragrance that becomes
            <span className="italic text-champagne-light"> part of your identity.</span>
          </h2>
          <p className="mt-4 max-w-md text-ivory/75">
            A curated edit of opulent ouds, signature eau de parfums and concentrated
            perfume oils — selected by our fragrance house for Ghanaian tastes.
          </p>
          <Button asChild size="lg" variant="accent" className="mt-8">
            <Link href="/shop">
              Explore Collection
              <ArrowRight size={15} strokeWidth={1.75} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}