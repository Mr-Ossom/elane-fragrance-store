"use server";

import { z } from "zod";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

const emailSchema = z.string().email();

const signUpSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

function authNotConfigured() {
  return { ok: false, error: "Authentication is not configured yet. Add Supabase credentials to enable accounts." } as const;
}

export async function signInAction(email: string, password: string) {
  if (!isSupabaseConfigured) return authNotConfigured();
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { ok: false, error: "Please enter a valid email address." } as const;
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: "Invalid email or password." } as const;
    return { ok: true, error: null } as const;
  } catch {
    return { ok: false, error: "Something went wrong signing in. Please try again." } as const;
  }
}

export async function signUpAction(input: z.infer<typeof signUpSchema>) {
  if (!isSupabaseConfigured) return authNotConfigured();
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your details." } as const;
  }
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
      },
    });
    if (error) return { ok: false, error: error.message } as const;
    if (data.session && data.user) {
      await upsertProfile(data.user.id, parsed.data.name, parsed.data.email);
    }
    return {
      ok: true,
      needsEmailConfirmation: !data.session,
      error: null,
    } as const;
  } catch {
    return { ok: false, error: "Something went wrong creating your account. Please try again." } as const;
  }
}

export async function resetPasswordAction(email: string) {
  if (!isSupabaseConfigured) return authNotConfigured();
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { ok: false, error: "Please enter a valid email address." } as const;
  const supabase = await createServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/account`,
  });
  if (error) return { ok: false, error: error.message } as const;
  return { ok: true, error: null } as const;
}

export async function signOutAction() {
  if (!isSupabaseConfigured) return authNotConfigured();
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { ok: true, error: null } as const;
}

export async function updatePasswordAction(newPassword: string) {
  if (!isSupabaseConfigured) return authNotConfigured();
  if (newPassword.length < 8) return { ok: false, error: "Password must be at least 8 characters." } as const;
  const supabase = await createServerClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message } as const;
  return { ok: true, error: null } as const;
}

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});

export async function updateProfileAction(input: z.infer<typeof profileSchema>) {
  if (!isSupabaseConfigured) return authNotConfigured();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your details." } as const;
  }
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." } as const;

  await supabase.auth.updateUser({ data: { full_name: parsed.data.fullName } });
  await upsertProfile(user.id, parsed.data.fullName, user.email ?? "", parsed.data.phone);
  revalidatePath("/account");
  return { ok: true, error: null } as const;
}

async function upsertProfile(userId: string, name: string, email: string, phone = "") {
  const supabase = await createServerClient();
  await supabase.from("profiles").upsert(
    { id: userId, full_name: name, email, phone, updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );
}