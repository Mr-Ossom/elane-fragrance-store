"use client";

import { MessageCircle } from "lucide-react";
import { brand, whatsappLink } from "@/lib/brand";

export function WhatsAppButton() {
  const label = `Hello ${brand.name}! I'd like to ask about a product.`;
  return (
    <a
      href={whatsappLink(label)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={{ width: 52, height: 52 }}
    >
      <MessageCircle className="h-6 w-6 text-white" strokeWidth={1.75} />
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-[#25D366]" />
      </span>
    </a>
  );
}

export function buildWhatsAppProductMessage(opts: {
  productName: string;
  brand: string;
  variantSize?: string;
  quantity?: number;
  price?: number;
}): string {
  const lines = [
    `Hello ${brand.name}! I'd like to order:`,
    ``,
    `• ${opts.brand} ${opts.productName}`,
    opts.variantSize ? `   Size: ${opts.variantSize}` : "",
    opts.quantity ? `   Qty: ${opts.quantity}` : "",
    opts.price ? `   Price: ${opts.price}` : "",
    ``,
    `Please confirm availability and delivery. Thank you!`,
  ].filter((l) => l !== "");
  return lines.join("\n");
}