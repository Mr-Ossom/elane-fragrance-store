import crypto from "node:crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

export const isPaystackConfigured = Boolean(
  process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY && process.env.PAYSTACK_SECRET_KEY
);

export function paystackSecret() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

export function amountInMinor(totalGhs: number): number {
  // GHS has 2 minor units (pesewas)
  return Math.round(Math.max(totalGhs, 0) * 100);
}

function paystackHeaders(secret: string) {
  return {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  };
}

/**
 * Initialize a Paystack transaction.
 * Amounts are always recomputed server-side from the stored order.
 */
export async function initializePaystack(options: {
  email: string;
  amountGhs: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, string>;
}): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> {
  const secret = paystackSecret();
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: paystackHeaders(secret),
    body: JSON.stringify({
      email: options.email,
      amount: amountInMinor(options.amountGhs),
      reference: options.reference,
      callback_url: options.callbackUrl,
      currency: "GHS",
      channels: ["mobile_money", "card", "bank", "ussd"],
      metadata: options.metadata,
    }),
    cache: "no-store",
  });

  const json = (await res.json()) as {
    status: boolean;
    message?: string;
    data?: { authorization_url?: string; access_code?: string; reference?: string };
  };

  if (!res.ok || !json.status || !json.data?.authorization_url) {
    throw new Error(`Paystack initialization failed: ${json.message ?? res.statusText}`);
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code ?? "",
    reference: json.data.reference ?? options.reference,
  };
}

export async function verifyPaystackTransaction(
  reference: string
): Promise<{
  paid: boolean;
  amountPaid: number;
  status: string;
  channel?: string;
}> {
  const secret = paystackSecret();
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: paystackHeaders(secret),
    cache: "no-store",
  });
  const json = (await res.json()) as {
    status: boolean;
    data?: { status?: string; amount?: number; channel?: string };
  };
  if (!res.ok || !json.status || !json.data) {
    throw new Error("Unable to verify payment at this time. Please contact support.");
  }
  const data = json.data;
  return {
    paid: data.status === "success",
    amountPaid: (data.amount ?? 0) / 100,
    status: data.status ?? "unknown",
    channel: data.channel,
  };
}

/**
 * Verify a Paystack webhook signature (HMAC-SHA512 of the raw body).
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const secret = paystackSecret();
  const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
}