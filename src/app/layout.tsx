import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Analytics } from "@/components/analytics";
import { Providers } from "@/components/providers";
import { brand, siteUrl } from "@/lib/brand";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} — Premium Fragrances in Ghana`,
    template: `%s | ${brand.name}`,
  },
  description: brand.description,
  keywords: [
    "perfume Ghana",
    "fragrance Ghana",
    "body cologne Ghana",
    "perfume oils Ghana",
    "Lattafa",
    "Armaf",
    "Afdan",
    "buy perfume Accra",
    "premium fragrances Ghana",
  ],
  authors: [{ name: brand.name }],
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: siteUrl,
    siteName: brand.name,
    title: `${brand.name} — Premium Fragrances in Ghana`,
    description: brand.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} — Premium Fragrances in Ghana`,
    description: brand.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1917",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}