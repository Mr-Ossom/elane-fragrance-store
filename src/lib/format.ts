import { brand } from "@/lib/brand";

export function formatPrice(amount: number): string {
  const value = new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${brand.currencySymbol}${value}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GH").format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function toKobo(amount: number): number {
  return Math.round(amount * 100);
}