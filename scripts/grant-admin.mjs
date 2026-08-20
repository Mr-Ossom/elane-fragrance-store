#!/usr/bin/env node
/**
 * Promote an existing user to admin.
 *
 * Usage:
 *   Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env
 *   (the script also reads .env.local automatically).
 *   node scripts/grant-admin.mjs <email>
 */
import { readFileSync, existsSync } from "node:fs";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/grant-admin.mjs <email>");
  process.exit(1);
}

if (existsSync(".env")) {
  const env = readFileSync(".env", "utf8");
  for (const line of env.split("\n")) {
    const [k, ...rest] = line.trim().split("=");
    if (k && !process.env[k]) process.env[k] = rest.join("=").replace(/^["']|["']$/g, "");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const api = `${url.replace(/\/$/, "")}/rest/v1`;

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const profile = await fetch(
  `${api}/profiles?select=email,role&email=eq.${encodeURIComponent(email)}`,
  { headers }
).then((r) => r.json());

if (!profile?.length) {
  console.error(`  ✗ No profile found for ${email}`);
  process.exit(1);
}

const res = await fetch(`${api}/profiles?email=eq.${encodeURIComponent(email)}`, {
  method: "PATCH",
  headers,
  body: JSON.stringify({ role: "admin", updated_at: new Date().toISOString() }),
});

if (!res.ok) {
  console.error(`  ✗ ${res.status} ${await res.text()}`);
  process.exit(1);
}

const [row] = await res.json();
console.log(`  ✓ ${row.email} is now role=${row.role}`);