// FILE: web/app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Canlı URL veya Localhost
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Ana kılavuz/araç/bölüm girişleri (PREMIUM BURADAN ÇIKARILDI)
  const staticPaths = [
    "", 
    "tools", 
    "guidelines", 
    "sections", 
    "programs", 
    "kayseritip"
  ];

  // Bölüm altı: Herkese açık (Canonical) tıbbi branşlar
  const sections = [
    "nefroloji",
    "gastroenteroloji",
    "hematoloji",
    "romatoloji",
    "kardiyoloji",
    "endokrinoloji",
    "infeksiyon",
    "gogus"
  ].map(s => `sections/${encodeURIComponent(s)}`);

  // URL'leri harmanla ve Google'a sun
  const urls = [...staticPaths, ...sections].map(p => ({
    url: `${base}/${p}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    // Ana sayfa ise öncelik 1.0, alt sayfalar ise 0.8 yapalım (SEO standardı)
    priority: p === "" ? 1.0 : 0.8,
  }));

  return urls;
}