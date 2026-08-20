"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import type { Coupon } from "@/types";
import { adminSaveCoupon } from "@/app/actions/admin";
import { formatPrice, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CouponsAdminClient({ coupons }: { coupons: Coupon[] }) {
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = React.useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    minOrder: "",
    maxUses: "",
    active: true,
  });

  async function remove(coupon: Coupon) {
    setSaving(true);
    setMessage(null);
    const result = await adminSaveCoupon({ ...coupon, active: false });
    setSaving(false);
    setMessage(result.ok ? { ok: true, text: `"${coupon.code}" deactivated.` } : { ok: false, text: result.error ?? "Failed to save" });
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const { code, type, value, minOrder, maxUses, active } = form;
    const result = await adminSaveCoupon({
      code,
      type,
      value: Number(value),
      minOrder: minOrder === "" ? null : Number(minOrder),
      maxUses: maxUses === "" ? null : Number(maxUses),
      active,
    });
    setSaving(false);
    if (result.ok) {
      setMessage({ ok: true, text: "Coupon created." });
      setForm({ code: "", type: "percentage", value: "", minOrder: "", maxUses: "", active: true });
    } else {
      setMessage({ ok: false, text: result.error ?? "Failed to create coupon" });
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-serif font-semibold">Coupons</h1>

      <div className="mt-5 grid gap-6 lg:grid-cols-[340px_1fr]">
        <form onSubmit={create} className="space-y-3 rounded-sm border border-border bg-background p-5">
          <h2 className="font-medium">New coupon</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              Code
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                required
                className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-champagne-deep"
                placeholder="WELCOME10"
              />
            </label>
            <label className="text-sm">
              Type
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "percentage" | "fixed" })}
                className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-champagne-deep"
              >
                <option value="percentage">Percentage %</option>
                <option value="fixed">Fixed GH₵</option>
              </select>
            </label>
          </div>
          <label className="block text-sm">
            Value
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              required
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-champagne-deep"
              placeholder="10"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              Min order (empty = none)
              <input
                type="number"
                min="0"
                value={form.minOrder}
                onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-champagne-deep"
              />
            </label>
            <label className="text-sm">
              Max uses
              <input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-champagne-deep"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 accent-[#8a7a56]"
            />
            Active immediately
          </label>
          {message && (
            <p
              className={cn(
                "rounded-sm border p-2.5 text-sm",
                message.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-destructive/40 bg-destructive/10 text-destructive"
              )}
            >
              {message.text}
            </p>
          )}
          <Button type="submit" disabled={saving} className="w-full gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Create Coupon
          </Button>
        </form>

        <div className="overflow-x-auto rounded-sm border border-border bg-background">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Min order</th>
                <th className="px-4 py-3">Uses</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((c) => (
                <tr key={c.id} className={cn(!c.active && "opacity-50")}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{c.code}</td>
                  <td className="px-4 py-3">
                    {c.type === "percentage" ? `${c.value}%` : formatPrice(c.value)}
                  </td>
                  <td className="px-4 py-3">{c.minOrder != null ? formatPrice(c.minOrder) : "—"}</td>
                  <td className="px-4 py-3">
                    {c.uses}
                    {c.maxUses != null ? ` / ${c.maxUses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.expiresAt ? formatDate(c.expiresAt) : "Never"}</td>
                  <td className="px-4 py-3">
                    {c.active ? <Badge variant="success">Active</Badge> : <Badge variant="outline">Off</Badge>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.active && (
                      <button
                        type="button"
                        onClick={() => remove(c)}
                        className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                      >
                        <Trash2 size={13} /> Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No coupons yet. Create your first one on the left.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
        <CheckCircle2 size={13} className="text-emerald-600" />
        Delivery fees and coupons are applied on the server at checkout — prices are never trusted from the browser.
      </p>
    </div>
  );
}