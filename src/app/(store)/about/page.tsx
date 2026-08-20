import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Droplets, Leaf, Truck } from "lucide-react";
import { brand } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About ÉLANÉ",
  description: `${brand.name} curates authentic luxury fragrances for Ghana — gennuine bottles, doorstep delivery in Accra, Kumasi and beyond.`,
};

export default function AboutPage() {
  return (
    <div>
      <section className="container-site max-w-3xl py-14">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-champagne-deep">Our story</p>
          <h1 className="mt-3 text-5xl sm:text-6xl">Luxury, delivered to your doorstep in Ghana.</h1>
        </div>
        <div className="mt-10 space-y-5 text-base leading-relaxed text-muted-foreground">
          <p>
            {brand.name} was born from a simple frustration: finding authentic, well-priced designer fragrances in
            Accra meant hours of shopping — and trusting whether what you bought was real. We set out to change that.
          </p>
          <p>
            Every bottle we sell is sourced from authorised distributors, checked for batch codes and authenticity,
            and stored correctly so it reaches you exactly as the perfumer intended.
          </p>
          <p>
            From your first spritz to your last drop, we&apos;re here to help you find — and keep — your signature scent.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="container-site grid gap-8 py-12 sm:grid-cols-3">
          {[
            { icon: Droplets, title: "100% Genuine", text: "Every fragrance is sourced from authorised distributors with verified authenticity." },
            { icon: Truck, title: "Nationwide Delivery", text: "Fast, trackable delivery across Ghana with carefully packed, travel-safe parcels." },
            { icon: Leaf, title: "Sustainably Packed", text: "Recyclable packaging, carbon-conscious every-few-orders retail drops." },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="text-center sm:text-left">
                <Icon size={26} strokeWidth={1.25} className="mx-auto sm:mx-0 text-champagne-deep" />
                <h3 className="mt-3 font-serif text-xl font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="delivery" className="container-site max-w-3xl py-14">
        <h2 className="text-3xl">Delivery & shipping</h2>
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            We deliver across every region of Ghana. Delivery fees are calculated at checkout based on your area and are
            displayed before you pay — never hidden.
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><span className="font-medium text-foreground">Greater Accra</span> — 1–2 working days</li>
            <li><span className="font-medium text-foreground">Kumasi, Takoradi, Cape Coast</span> — 2–4 working days</li>
            <li><span className="font-medium text-foreground">All other regions</span> — 3–6 working days</li>
          </ul>
        </div>
        <Link href="/shop" className="mt-6 inline-flex items-center gap-1.5 text-sm text-champagne-deep hover:underline">
          Shop the collection <ArrowRight size={14} />
        </Link>
      </section>

      <section id="returns" className="border-t border-border bg-secondary/40">
        <div className="container-site max-w-3xl py-14">
          <h2 className="text-3xl">Returns & authenticity</h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              We stand behind every fragrance. If an item arrives damaged or faulty, contact us within 7 days and we&apos;ll
              replace it or refund you in full. For hygiene reasons, we can&apos;t accept returns on opened fragrances unless
              they&apos;re faulty.
            </p>
            <p>
              Concerned about authenticity? Contact us with your batch code and we&apos;ll verify it against the distributor
              records before you spray a single drop.
            </p>
          </div>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/contact">Ask us anything</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}