import { Database, Info } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function SetupNotice() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="mt-6 rounded-sm border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <div className="flex items-start gap-2">
        <Info size={16} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">
            Accounts are waiting for Supabase setup
          </p>
          <p className="mt-1 text-xs leading-relaxed">
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable sign in, order tracking and your dashboard. You can
            still shop and check out as a guest today.
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium">
            <Database size={13} />
            See <code>db/schema.sql</code> to create the required tables.
          </p>
        </div>
      </div>
    </div>
  );
}