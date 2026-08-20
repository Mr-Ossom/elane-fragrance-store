import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { brand } from "@/lib/brand";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Reach the ÉLANÉ team — WhatsApp, phone, email or visit us in Accra.",
};

export default function ContactPage() {
  return (
    <div className="container-site max-w-5xl py-14">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-champagne-deep">Contact</p>
        <h1 className="mt-3 text-5xl sm:text-6xl">We&apos;re here to help.</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Questions about an order, a scent recommendation, or authenticating a purchase? Reach out any time.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <aside>
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <Phone size={18} className="mt-0.5 shrink-0 text-champagne-deep" />
              <div>
                <p className="font-medium">Call us</p>
                <a href={`tel:${brand.supportPhone}`} className="text-sm text-muted-foreground hover:text-foreground">
                  {brand.supportPhone}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={18} className="mt-0.5 shrink-0 text-champagne-deep" />
              <div>
                <p className="font-medium">Email</p>
                <a href={`mailto:${brand.email}`} className="text-sm text-muted-foreground hover:text-foreground">
                  {brand.email}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-champagne-deep" />
              <div>
                <p className="font-medium">Showroom</p>
                <p className="text-sm text-muted-foreground">{brand.address}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-sm border border-border bg-secondary/40 p-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Order support hours</p>
            <p className="mt-1">Mon–Sat · 9:00 – 18:00 GMT</p>
            <p className="mt-0.5">WhatsApp replies typically within minutes.</p>
          </div>
        </aside>

        <div className="rounded-sm border border-border bg-card p-6">
          <h2 className="text-2xl">Send us a message</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your message opens in WhatsApp so we can reply in real time.
          </p>
          <div className="mt-5">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}