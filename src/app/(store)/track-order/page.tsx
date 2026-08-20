import type { Metadata } from "next";
import { TrackOrderClient } from "@/components/track-order-client";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track your ÉLANÉ order status in real time — enter your order number and phone to check delivery updates.",
};

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}