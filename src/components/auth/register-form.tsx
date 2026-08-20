"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signUpAction } from "@/app/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SetupNotice } from "@/components/auth/setup-notice";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const result = await signUpAction({ name, email, password });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.needsEmailConfirmation) {
      setNotice("Almost there! Check your inbox to confirm your email address, then sign in.");
    } else {
      router.push("/account");
      router.refresh();
    }
  }

  return (
    <div className="container-site flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <h1 className="text-center text-4xl">Create your account</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Save your details, track orders and never miss your saved scents.
        </p>

        {!isSupabaseConfigured && <SetupNotice />}

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4 rounded-sm border border-border bg-card p-6">
          <div>
            <Label htmlFor="reg-name">Full name</Label>
            <Input id="reg-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="reg-email">Email</Label>
            <Input id="reg-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="reg-password">Password</Label>
            <Input id="reg-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
          </div>
          {error && (
            <p role="alert" className="rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="rounded-sm border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {notice}
            </p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Create Account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-champagne-deep underline-offset-2 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}