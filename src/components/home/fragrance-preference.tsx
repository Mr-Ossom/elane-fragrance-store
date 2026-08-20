import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";

export const fragranceFamilies = [
  { name: "Fresh", note: "Citrus, aquatic & green", accent: "bg-emerald-800", swatch: "#5d7a5d" },
  { name: "Woody", note: "Sandal, cedar & vetiver", accent: "bg-amber-900", swatch: "#6f5a3e" },
  { name: "Sweet", note: "Vanilla, caramel & gourmand", accent: "bg-rose-700", swatch: "#b4786a" },
  { name: "Floral", note: "Rose, jasmine & peony", accent: "bg-rose-300", swatch: "#d3b9a8" },
  { name: "Oud", note: "Resinous, smoky & rich", accent: "bg-yellow-900", swatch: "#6b5634" },
  { name: "Citrus", note: "Lemon, bergamot & neroli", accent: "bg-lime-600", swatch: "#8a7a3a" },
  { name: "Musky", note: "Clean, skin & ambrette", accent: "bg-stone-400", swatch: "#6e685f" },
  { name: "Oriental", note: "Spices, amber & incense", accent: "bg-orange-700", swatch: "#b8946a" },
];

export function FragrancePreference() {
  return (
    <section className="border-y border-border bg-secondary/50">
      <div className="container-site py-16 sm:py-20">
        <SectionHeading
          eyebrow="Find Your Signature"
          title="Shop by Preference"
          description="Every nose is different. Start with a fragrance family and let us guide you home."
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8 lg:gap-2">
          {fragranceFamilies.map((f) => (
            <Link
              key={f.name}
              href={`/shop?family=${f.name}`}
              className="group flex flex-col items-center gap-3 rounded-sm border border-border bg-card px-3 py-6 text-center transition-all hover:-translate-y-0.5 hover:border-champagne/60 hover:shadow-sm"
            >
              <span
                className="h-12 w-12 rounded-full border-2 border-ivory shadow-inner transition-transform group-hover:scale-110"
                style={{ backgroundColor: f.swatch }}
                aria-hidden
              />
              <span className="font-serif text-lg font-semibold">{f.name}</span>
              <span className="text-[11px] leading-snug text-muted-foreground">{f.note}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}