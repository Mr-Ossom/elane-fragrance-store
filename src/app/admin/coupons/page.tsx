import type { Metadata } from "next";
import { getCouponsAdmin } from "@/lib/data-access/admin-store";
import { CouponsAdminClient } from "@/components/admin/coupons-admin-client";

export const metadata: Metadata = {
  title: "Coupons",
};

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await getCouponsAdmin();
  return <CouponsAdminClient coupons={coupons} />;
}