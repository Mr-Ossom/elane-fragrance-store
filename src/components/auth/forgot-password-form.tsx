"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { resetPasswordAction } from "@/app/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SetupNotice } from "@/components/auth/setup-notice";

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await resetPasswordAction(email);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  return (
    <div className="container-site flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <h1 className="text-center text-4xl">Reset your password</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {!isSupabaseConfigured && <SetupNotice />}

        {sent ? (
          <div className="mt-8 rounded-sm border border-emerald-200 bg-emerald-50 p-6 text-center text-sm text-emerald-800">
            If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way. Check
            your inbox and spam folder.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4 rounded-sm border border-border bg-card p-6">
            <div>
              <Label htmlFor="fp-email">Email</Label>
              <Input id="fp-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {error && (
              <p role="alert" className="rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Send Reset Link"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-champagne-deep underline-offset-2 hover:underline">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}