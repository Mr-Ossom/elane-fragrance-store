import { NextResponse } from "next/server";
import { z } from "zod";
import { getProducts } from "@/lib/data-access/store";

const querySchema = z.object({
  q: z.string().trim().min(1).max(80).default(""),
  limit: z.coerce.number().int().min(1).max(24).default(8),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? "",
    limit: searchParams.get("limit") ?? "8",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }
  const { q, limit } = parsed.data;
  if (!q) return NextResponse.json({ products: [] });

  const products = await getProducts({
    search: q,
    limit,
    availability: "in_stock",
  });
  return NextResponse.json({ products });
}