// FILE: web/app/robots.ts
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        // Premium KONU sayfaları taranmasın: girişsiz ziyaretçiye "Erişim
        // Kısıtlı" kartı döndükleri için Google'a yüzlerce içeriksiz sayfa
        // gibi görünürler ve sitenin genel kalite sinyalini aşağı çekerler.
        // Sondaki eğik çizgi bilinçli — tanıtım sayfasının kendisi
        // (/tr/premium/ydus) taranabilir kalıyor, çünkü satış oradan yapılıyor.
        "/*/premium/ydus/",
        // Eski, dilsiz yol; bir dönem kullanılmıştı.
        "/premium",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
