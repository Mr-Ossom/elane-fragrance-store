"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { updatePasswordAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ChangePasswordForm() {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [message, setMessage] = React.useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (next.length < 8) {
      setMessage({ ok: false, text: "New password must be at least 8 characters." });
      return;
    }
    if (next !== confirm) {
      setMessage({ ok: false, text: "Passwords do not match." });
      return;
    }
    setLoading(true);
    const result = await updatePasswordAction(next);
    setLoading(false);
    if (result.ok) {
      setCurrent("");
      setNext("");
      setConfirm("");
      setMessage({ ok: true, text: "Password updated successfully." });
    } else {
      setMessage({ ok: false, text: result.error });
    }
  }

  return (
    <div className="container-site max-w-md py-12">
      <h1 className="text-3xl">Change password</h1>
      <p className="mt-2 text-sm text-muted-foreground">Update the password used to sign in to your account.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="pw-current">Current password</Label>
          <Input id="pw-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="pw-new">New password</Label>
          <Input id="pw-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="pw-confirm">Confirm new password</Label>
          <Input id="pw-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </div>
        {message && (
          <p
            className={cn(
              "rounded-sm border p-3 text-sm",
              message.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-destructive/40 bg-destructive/10 text-destructive"
            )}
          >
            {message.text}
          </p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
        </Button>
      </form>
    </div>
  );
}