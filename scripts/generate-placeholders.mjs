import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images", "products");
mkdirSync(outDir, { recursive: true });

// Muted luxury palettes per fragrance family / mood
const palettes = {
  Sweet: { bg: "#e8dcc8", glass: "#c8b088", accent: "#8a6a3b", deep: "#5c452a" },
  Woody: { bg: "#dcd2c0", glass: "#b09a7c", accent: "#6f5a3e", deep: "#3f3327" },
  Floral: { bg: "#eadfd6", glass: "#d3b9a8", accent: "#a5785f", deep: "#6e4a3c" },
  Oud: { bg: "#d9cdb8", glass: "#a18d68", accent: "#6b5634", deep: "#35291a" },
  Fresh: { bg: "#dce3dc", glass: "#a8c0a8", accent: "#5d7a5d", deep: "#2f4a36" },
  Citrus: { bg: "#e8e0c8", glass: "#cfc08a", accent: "#8a7a3a", deep: "#4a4120" },
  Musky: { bg: "#d9d6d2", glass: "#a9a49c", accent: "#6e685f", deep: "#38342e" },
  Oriental: { bg: "#e2d3c0", glass: "#b8946a", accent: "#7a573a", deep: "#3f2c1d" },
  Unisex: { bg: "#e4ddd0", glass: "#bdac90", accent: "#7c6a4e", deep: "#3c3324" },
};

const familyOf = {
  "lattafa-khamrah": "Sweet",
  "lattafa-khamrah-2": "Oriental",
  "lattafa-asad": "Woody",
  "afnan-9pm": "Sweet",
  "armaf-club-de-nuit": "Fresh",
  "oud-al-sahraa": "Oud",
  "detour-noir": "Oriental",
  "wild-azraq": "Oud",
  "fakhar-rose": "Floral",
  "shaghaf-oud": "Oud",
  elala: "Floral",
  "body-cologne-heritage": "Musky",
  "body-cologne-urban": "Fresh",
  "body-mist-amber": "Sweet",
  "perfume-oil-royal-oud": "Oud",
  "perfume-oil-jasmine": "Floral",
  "perfume-oil-edn": "Sweet",
  "perfume-oil-grace": "Fresh",
  "gift-set-his-hers": "Musky",
  "gift-set-vault": "Oriental",
  "lattafa-ehsas": "Floral",
  "al-dirgham": "Fresh",
  "body-cologne-unisex": "Unisex",
  "qaed-al-fursan": "Citrus",
  "liquid-brun": "Woody",
};

function caps(name) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function bottle(p, type = "bottle") {
  const gx = 470, gy = 350;
  if (type === "oil") {
    // Roll-on oil vial
    return `
    <rect x="540" y="420" width="120" height="360" rx="16" fill="${p.glass}" />
    <rect x="560" y="200" width="80" height="230" fill="${p.glass}" />
    <circle cx="600" cy="180" r="46" fill="${p.deep}" />
    <rect x="586" y="150" width="28" height="40" rx="6" fill="${p.accent}" opacity="0.85" />
    <rect x="590" y="470" width="20" height="180" rx="8" fill="${p.accent}" opacity="0.5" />
    <rect x="560" y="660" width="80" height="60" rx="8" fill="${p.accent}" opacity="0.35" />`;
  }
  if (type === "set") {
    return `
    <rect x="470" y="500" width="260" height="220" rx="10" fill="none" stroke="${p.accent}" stroke-width="3" />
    <rect x="490" y="540" width="70" height="130" rx="10" fill="${p.glass}" />
    <rect x="585" y="540" width="70" height="130" rx="10" fill="${p.glass}" />
    <rect x="680" y="540" width="40" height="130" rx="10" fill="${p.glass}" />
    <rect x="490" y="430" width="220" height="16" rx="8" fill="${p.deep}" />
    <rect x="506" y="470" width="12" height="90" fill="${p.accent}" />
    <rect x="598" y="470" width="12" height="90" fill="${p.accent}" />
    <rect x="690" y="470" width="12" height="90" fill="${p.accent}" />`;
  }
  // Classic spray bottle
  return `
    <rect x="516" y="420" width="168" height="330" rx="14" fill="${p.glass}" />
    <rect x="472" y="300" width="72" height="130" rx="8" fill="${p.glass}" />
    <rect x="556" y="300" width="72" height="130" rx="8" fill="${p.glass}" />
    <rect x="470" y="250" width="160" height="58" rx="10" fill="${p.deep}" />
    <rect x="536" y="212" width="28" height="44" rx="6" fill="${p.accent}" />
    <path d="M548 176 L552 210 L560 210 L552 238 L544 210 L552 210" fill="none" stroke="${p.accent}" stroke-width="4" />
    <rect x="548" y="176" width="4" height="36" fill="${p.accent}" />
    <rect x="544" y="150" width="12" height="30" rx="4" fill="${p.deep}" />
    <rect x="546" y="470" width="8" height="120" fill="${p.accent}" opacity="0.55" />
    <rect x="572" y="500" width="8" height="150" fill="${p.accent}" opacity="0.4" />
    <rect x="600" y="470" width="8" height="120" fill="${p.accent}" opacity="0.3" />`;
}

function frame(p, label, type) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="${p.bg}" />
      <stop offset="100%" stop-color="${p.deep}" />
    </radialGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${p.glass}" />
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.45" />
      <stop offset="100%" stop-color="${p.glass}" />
    </linearGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#bg)" />
  <circle cx="600" cy="600" r="430" fill="none" stroke="${p.accent}" stroke-width="2" opacity="0.55" />
  <circle cx="600" cy="600" r="398" fill="none" stroke="${p.accent}" stroke-width="1" opacity="0.35" />
  <g filter="drop-shadow(0 24px 40px rgba(20,14,8,0.35))">${bottle(p, type)}</g>
  <text x="600" y="240" text-anchor="middle" font-family="Georgia, serif" font-size="34" letter-spacing="10" fill="${p.accent}" opacity="0.9">ÉLANÉ</text>
  <text x="600" y="970" text-anchor="middle" font-family="Georgia, serif" font-size="56" letter-spacing="4" fill="#fbf7ef" opacity="0.95">${label}</text>
  <text x="600" y="1024" text-anchor="middle" font-family="Arial, sans-serif" font-size="21" letter-spacing="7" fill="#fbf7ef" opacity="0.6">FRAGRANCE HOUSE GHANA</text>
</svg>`;
}

for (const [slug, family] of Object.entries(familyOf)) {
  const p = palettes[family] || palettes.Unisex;
  const type = slug.startsWith("perfume-oil")
    ? "oil"
    : slug.startsWith("gift-set")
      ? "set"
      : "bottle";
  const label = caps(slug);
  writeFileSync(join(outDir, `${slug}.svg`), frame(p, label, type));
  console.log("wrote", slug);
}

for (const [slug, label] of Object.entries({
  "category-perfumes": "PERFUMES",
  "category-body-colognes": "BODY COLOGNES",
  "category-perfume-oils": "PERFUME OILS",
  "category-gift-sets": "GIFT SETS",
})) {
  const p = slug.endsWith("body-colognes")
    ? palettes.Fresh
    : slug.endsWith("perfume-oils")
      ? palettes.Oud
      : slug.endsWith("gift-sets")
        ? palettes.Oriental
        : palettes.Woody;
  const type = slug.endsWith("perfume-oils") ? "oil" : slug.endsWith("gift-sets") ? "set" : "bottle";
  writeFileSync(join(outDir, `${slug}.svg`), frame(p, label, type));
  console.log("wrote", slug);
}

// Editorial hero (wide)
const hp = palettes.Oud;
const hero = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <defs>
    <radialGradient id="hbg" cx="30%" cy="40%" r="80%">
      <stop offset="0%" stop-color="${hp.bg}" />
      <stop offset="100%" stop-color="${hp.deep}" />
    </radialGradient>
  </defs>
  <rect width="1600" height="1000" fill="url(#hbg)" />
  <text x="800" y="150" text-anchor="middle" font-family="Georgia, serif" font-size="40" letter-spacing="14" fill="${hp.accent}" opacity="0.95">ÉLANÉ</text>
  <g filter="drop-shadow(0 30px 50px rgba(15,10,5,0.4))" transform="translate(760 120) scale(1.45)">${bottle(hp)}</g>
  <circle cx="800" cy="500" r="420" fill="none" stroke="${hp.accent}" stroke-width="2" opacity="0.4" />
  <text x="800" y="880" text-anchor="middle" font-family="Georgia, serif" font-size="72" letter-spacing="6" fill="#fbf7ef">Your Signature Scent Awaits</text>
</svg>`;
writeFileSync(join(outDir, "hero.svg"), hero);
console.log("wrote hero");

console.log("done");