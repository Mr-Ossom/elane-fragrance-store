import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/shop", "/about", "/contact", "/privacy", "/wishlist", "/track-order"] as const;
  const now = new Date();

  return staticPages.map((p) => ({
    url: `${siteUrl}${p}`,
    lastModified: now,
    changeFrequency: p === "" || p === "/shop" ? ("daily" as const) : ("monthly" as const),
    priority: p === "" ? 1 : 0.7,
  }));
}