import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getOrdersByUser } from "@/lib/data-access/store";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { AccountOverview } from "@/components/account/account-overview";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your ÉLANÉ account — orders, profile, addresses and more.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  if (!isSupabaseConfigured) {
    return <AccountUnavailable />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/account");

  const orders = await getOrdersByUser(user.id);
  const fullName = (user.user_metadata?.full_name as string | undefined) ?? "";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (
    <AccountOverview
      user={{ id: user.id, email: user.email ?? "", fullName }}
      orders={orders}
      role={profile?.role}
    />
  );
}