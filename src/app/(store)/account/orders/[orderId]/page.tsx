import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getOrderByIdSupabase } from "@/lib/data-access/supabase-store";
import { OrderDetailClient } from "@/components/account/order-detail-client";

export const metadata: Metadata = {
  title: "Order Details",
  robots: { index: false, follow: false },
};

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  if (!isSupabaseConfigured) {
    redirect("/account");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account");

  const order = await getOrderByIdSupabase(orderId);
  if (!order || (order.userId && order.userId !== user.id)) {
    notFound();
  }

  return <OrderDetailClient order={order} />;
}