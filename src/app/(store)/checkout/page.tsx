import type { Metadata } from "next";
import { getDeliveryZones } from "@/lib/data-access/store";
import { CheckoutPageClient } from "@/components/checkout/checkout-page-client";

export const metadata: Metadata = {
  title: "Secure Checkout",
  description:
    "Fast, secure checkout. Pay with MTN Mobile Money, Telecel Cash, AirtelTigo Money, Visa or Mastercard.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const zones = await getDeliveryZones();
  return <CheckoutPageClient zones={zones} />;
}