import { siteUrl, SITE_ADI, SITE_ACIKLAMA } from "@/lib/site";

/**
 * Yapısal veri (JSON-LD) yardımcıları.
 *
 * Arama motoruna sayfanın NE olduğunu söyler: bu bir tıbbi konu anlatımı mı,
 * bir hesaplayıcı mı, hangi başlık altında duruyor. Karşılığı sonuç
 * sayfasında kırıntı yolu ve zengin görünüm; metadata'nın söylemediğini söyler.
 */

/** JSON-LD gömerken </script> kaçışı şart — içerikte geçen "<" sayfayı kırabilir. */
function guvenliJson(veri: unknown): string {
  return JSON.stringify(veri).replace(/</g, "\\u003c");
}

export function JsonLd({ veri }: { veri: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: guvenliJson(veri) }}
    />
  );
}

export function organizasyonSemasi() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: SITE_ADI,
    url: base,
    description: SITE_ACIKLAMA,
  };
}

export function siteSemasi() {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: SITE_ADI,
    url: base,
    inLanguage: "tr-TR",
    publisher: { "@id": `${base}/#organization` },
  };
}

type KirintiAdim = { ad: string; yol: string };

export function kirintiSemasi(adimlar: KirintiAdim[]) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: adimlar.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.ad,
      item: `${base}${a.yol}`,
    })),
  };
}

export function konuSemasi(opts: {
  baslik: string;
  aciklama: string;
  yol: string;
  guncelleme?: string;
  etiketler?: string[];
}) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    // MedicalWebPage, sağlık içeriğini genel makaleden ayırır.
    "@type": "MedicalWebPage",
    name: opts.baslik,
    headline: opts.baslik,
    description: opts.aciklama || undefined,
    url: `${base}${opts.yol}`,
    inLanguage: "tr-TR",
    isPartOf: { "@id": `${base}/#website` },
    publisher: { "@id": `${base}/#organization` },
    dateModified: opts.guncelleme || undefined,
    keywords: opts.etiketler?.length ? opts.etiketler.join(", ") : undefined,
    // Hedef kitle hekim; tüketici sağlık içeriğiyle karıştırılmasın.
    audience: { "@type": "MedicalAudience", audienceType: "Physician" },
  };
}

export function aracSemasi(opts: { ad: string; aciklama: string; yol: string }) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: opts.ad,
    description: opts.aciklama,
    url: `${base}${opts.yol}`,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    inLanguage: "tr-TR",
    publisher: { "@id": `${base}/#organization` },
    // Araçlar gerçekten ücretsiz ve kayıt istemiyor; yazan da bu.
    offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
  };
}
