import type { Metadata } from "next";
import { getZonesAdmin } from "@/lib/data-access/admin-store";
import { DeliveryAdminClient } from "@/components/admin/delivery-admin-client";

export const metadata: Metadata = {
  title: "Delivery",
};

export const dynamic = "force-dynamic";

export default async function AdminDeliveryPage() {
  const zones = await getZonesAdmin();
  return <DeliveryAdminClient zones={zones} />;
}