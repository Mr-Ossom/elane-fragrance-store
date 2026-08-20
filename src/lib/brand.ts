export const brand = {
  name: "ÉLANÉ",
  legalName: "ÉLANÉ Fragrance House",
  subtitle: "Fragrance House Ghana",
  tagline: "Your Signature Scent Awaits.",
  description:
    "Discover premium fragrances, body colognes and perfume oils curated for every occasion.",
  currency: "GHS",
  currencySymbol: "GH₵",
  supportPhone: "+233 20 000 0000",
  supportPhoneDisplay: "+233 20 000 0000",
  whatsappNumber: "233200000000",
  email: "hello@elanefragrance.gh",
  address: "Accra, Ghana",
  hours: "Mon – Sat · 9:00 AM – 7:00 PM",
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    tiktok: "https://tiktok.com",
  },
  deliveryNote:
    "We deliver to all 16 regions of Ghana. Delivery is same-day or next-day within Accra, Tema and Kumasi metro areas, and 1–3 days nationwide.",
} as const;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://elane-fragrance.vercel.app";

export function formatPhoneForWhatsApp(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

export function whatsappLink(message: string): string {
  const number = formatPhoneForWhatsApp(brand.whatsappNumber);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
