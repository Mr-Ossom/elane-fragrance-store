"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import type { DeliveryZone } from "@/types";
import { adminUpdateZone } from "@/app/actions/admin";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DeliveryAdminClient({ zones }: { zones: DeliveryZone[] }) {
  const [saving, setSaving] = React.useState<string | null>(null);
  const [edited, setEdited] = React.useState<Record<string, { fee: string; estimatedDays: string; active: boolean }>>({});

  function local(z: DeliveryZone) {
    return edited[z.id] ?? { fee: String(z.fee), estimatedDays: z.estimatedDays, active: z.active };
  }

  async function save(z: DeliveryZone) {
    const value = local(z);
    setSaving(z.id);
    await adminUpdateZone({ zoneId: z.id, fee: Number(value.fee), estimatedDays: value.estimatedDays, active: value.active });
    setSaving(null);
    setEdited((prev) => {
      const next = { ...prev };
      delete next[z.id];
      return next;
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-serif font-semibold">Delivery zones</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Zones and fees are read at checkout on the server — changing them here updates every future order automatically.
      </p>
      <div className="mt-5 space-y-3">
        {zones.map((zone) => {
          const value = local(zone);
          const dirty =
            Number(value.fee) !== zone.fee || value.estimatedDays !== zone.estimatedDays || value.active !== zone.active;
          return (
            <div key={zone.id} className="rounded-sm border border-border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-medium">
                    {zone.name}
                    {value.active ? <Badge variant="success">Active</Badge> : <Badge variant="outline">Disabled</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{zone.cities.slice(0, 5).join(", ")}{zone.cities.length > 5 ? "…" : ""}</p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <label className="text-xs text-muted-foreground">
                    Fee (GH₵)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={value.fee}
                      disabled={saving === zone.id}
                      onChange={(e) => setEdited({ ...edited, [zone.id]: { ...value, fee: e.target.value } })}
                      className="mt-0.5 block w-24 rounded-sm border border-border bg-background px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-champagne-deep"
                    />
                  </label>
                  <label className="text-xs text-muted-foreground">
                    Est. delivery
                    <input
                      value={value.estimatedDays}
                      disabled={saving === zone.id}
                      onChange={(e) => setEdited({ ...edited, [zone.id]: { ...value, estimatedDays: e.target.value } })}
                      className="mt-0.5 block w-40 rounded-sm border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-champagne-deep"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setEdited({ ...edited, [zone.id]: { ...value, active: !value.active } })}
                    disabled={saving === zone.id}
                    className={cn(
                      "rounded-sm border px-3 py-1.5 text-sm",
                      value.active ? "border-destructive/40 text-destructive" : "border-emerald-300 text-emerald-700"
                    )}
                  >
                    {value.active ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    disabled={saving === zone.id || !dirty}
                    onClick={() => save(zone)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-sm px-4 py-1.5 text-sm font-medium",
                      dirty ? "bg-primary text-primary-foreground" : "cursor-not-allowed bg-secondary text-muted-foreground"
                    )}
                  >
                    {saving === zone.id ? <Loader2 size={14} className="animate-spin" /> : "Save"}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Currently charging {formatPrice(zone.fee)} per order.</p>
            </div>
          );
        })}
        {zones.length === 0 && (
          <div className="rounded-sm border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No delivery zones configured.
          </div>
        )}
      </div>
    </div>
  );
}