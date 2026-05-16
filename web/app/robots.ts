// FILE: web/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Canlıya alırken .env dosyandaki gerçek site adresini kullanır, yoksa localhost'a döner.
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin, API ve SADECE ÜYELERE ÖZEL olan Premium/YDUS alanlarını Google'dan gizliyoruz
      disallow: ["/admin", "/api", "/premium"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}