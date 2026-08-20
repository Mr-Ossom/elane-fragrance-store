"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Newspaper } from "lucide-react";
import { signInAction } from "@/app/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SetupNotice } from "@/components/auth/setup-notice";

export function LoginForm({ redirect }: { redirect: string }) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signInAction(email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(redirect);
      router.refresh();
    } catch {
      setError("Something went wrong signing in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-site flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <h1 className="text-center text-4xl">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in to track orders, view your wishlist and check out faster.
        </p>

        {!isSupabaseConfigured && <SetupNotice />}

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4 rounded-sm border border-border bg-card p-6">
          <div>
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-champagne-deep hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p role="alert" className="rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Sign In"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New to ÉLANÉ?{" "}
            <Link href="/register" className="text-champagne-deep underline-offset-2 hover:underline">
              Create an account
            </Link>
          </p>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Newspaper size={12} />
            No account needed to shop — you can check out as a guest.
          </p>
        </form>
      </div>
    </div>
  );
}