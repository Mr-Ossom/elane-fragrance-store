import type { Metadata } from "next";
import { getReviewsAdmin } from "@/lib/data-access/admin-store";
import { ReviewsAdminClient } from "@/components/admin/reviews-admin-client";

export const metadata: Metadata = {
  title: "Reviews",
};

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getReviewsAdmin();
  return <ReviewsAdminClient reviews={reviews} />;
}