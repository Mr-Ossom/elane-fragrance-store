import {
  Headset,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

const features = [
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    description: "Every fragrance is sourced from verified suppliers and genuine houses.",
  },
  {
    icon: Truck,
    title: "Delivery Across Ghana",
    description: "Same-day in Accra & Tema, and nationwide dispatch to all 16 regions.",
  },
  {
    icon: ShoppingBag,
    title: "Easy Ordering",
    description: "Checkout as a guest with Mobile Money, Visa or Mastercard — no account needed.",
  },
  {
    icon: Headset,
    title: "Real Human Support",
    description: "Chat with us on WhatsApp for recommendations, availability and delivery help.",
  },
  {
    icon: Sparkles,
    title: "Curated for Ghana",
    description: "Fragrances selected and tested for our warmth, our weather and our culture.",
  },
  {
    icon: RotateCcw,
    title: "Simple Returns",
    description: "Changed your mind? Reach out within 7 days for a smooth resolution.",
  },
];

export function WhyShopWithUs() {
  return (
    <section className="border-y border-border bg-secondary/50">
      <div className="container-site py-16 sm:py-20">
        <SectionHeading
          eyebrow="Why ÉLANÉ"
          title="Why Shop With Us?"
          description="A boutique fragrance experience, built for the way Ghana shops."
        />
        <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex gap-4 bg-card p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-secondary text-champagne-deep">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}