import { MapPin, Truck } from "lucide-react";
import type { DeliveryZone } from "@/types";
import { SectionHeading } from "@/components/section-heading";
import { formatPrice } from "@/lib/format";

export function GhanaDelivery({ zones }: { zones: DeliveryZone[] }) {
  return (
    <section className="bg-charcoal-deep text-ivory">
      <div className="container-site py-16 sm:py-20">
        <SectionHeading
          eyebrow="Nationwide"
          title="Delivered Across Ghana"
          description="From Accra to Tamale, we bring your fragrance to you. Simple, transparent delivery pricing."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zones.slice(0, 6).map((zone) => (
            <div
              key={zone.id}
              className="rounded-sm border border-ivory/10 bg-ivory/[0.04] p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-semibold text-champagne-light">
                  {zone.name}
                </h3>
                <Truck size={18} className="text-ivory/40" strokeWidth={1.5} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {zone.cities.slice(0, 5).map((city) => (
                  <span
                    key={city}
                    className="inline-flex items-center gap-1 rounded-sm border border-ivory/10 px-2 py-0.5 text-xs text-ivory/70"
                  >
                    <MapPin size={10} strokeWidth={1.5} />
                    {city}
                  </span>
                ))}
                {zone.cities.length > 5 && (
                  <span className="px-1 text-xs text-ivory/50">+{zone.cities.length - 5} more</span>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-ivory/10 pt-3 text-sm">
                <span className="text-ivory/70">{zone.estimatedDays}</span>
                <span className="font-medium text-champagne-light">{formatPrice(zone.fee)}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-ivory/60">
          Delivery fees are confirmed at checkout. Order before 3 PM for same-day dispatch in metro areas.
        </p>
      </div>
    </section>
  );
}