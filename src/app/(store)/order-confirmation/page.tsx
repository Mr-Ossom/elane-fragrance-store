import type { Metadata } from "next";
import { OrderConfirmationClient } from "@/components/checkout/order-confirmation-client";

export const metadata: Metadata = {
  title: "Order Confirmation",
  robots: { index: false, follow: false },
};

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;
  return <OrderConfirmationClient reference={reference ?? ""} />;
}