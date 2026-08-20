import { Database, PackageOpen } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { EmptyState } from "@/components/empty-state";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AccountUnavailable() {
  return (
    <div className="container-site py-10">
      <h1 className="text-4xl sm:text-5xl">My Account</h1>
      {!isSupabaseConfigured ? (
        <div className="mt-6 max-w-2xl">
          <div className="rounded-sm border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <Database size={17} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Accounts require Supabase to be configured</p>
                <p className="mt-1 text-xs leading-relaxed">
                  Add <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
                  <code>SUPABASE_SERVICE_ROLE_KEY</code> to your environment, then run the SQL in{" "}
                  <code>db/schema.sql</code>. Once configured, customers can register, sign in, track orders and save
                  wishlists across devices.
                </p>
              </div>
            </div>
          </div>
          <EmptyState
            icon={<PackageOpen size={24} />}
            title="Track your orders"
            description="When accounts are enabled you'll be able to view your order history and delivery status here."
            action={
              <Button asChild variant="outline">
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            }
          />
        </div>
      ) : null}
    </div>
  );
}