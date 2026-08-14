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

/**
 * İçerikteki okunabilir tarihi ISO 8601'e çevirir.
 *
 * schema.org `dateModified` ISO bekliyor; içerik ise insan için yazılmış
 * ("14 Mar 2026"). Ölçüldü — canlıda bütün konu sayfaları `dateModified`
 * alanını Türkçe metin olarak basıyordu, yani tazelik sinyali geçersizdi.
 *
 * İÇERİĞE DOKUNULMUYOR: 451 konu "14 Mar 2026", biri "26 Mart 2026"
 * biçiminde ve bu gösterim için doğru. Çeviri yalnızca şema katmanında.
 *
 * Ay adları içerikte üç biçimde geçiyor (ölçüldü): Türkçe kısa (Mar, Nis,
 * Ağu, Şub), Türkçe uzun (Mart) ve İngilizce kısa (Jun 20 kez, Jul 8 kez).
 * Üçü de karşılanıyor.
 *
 * Ayrıştırılamayan bir değer için alan HİÇ BASILMAZ — geçersiz bir tarih
 * basmaktansa sinyali vermemek doğru; uydurma bir tarih arama motoruna
 * yanlış tazelik bildirir.
 */
const AY_NO: Record<string, number> = {
  oca: 1, ocak: 1, jan: 1, ocak_: 1,
  sub: 2, şub: 2, subat: 2, şubat: 2, feb: 2,
  mar: 3, mart: 3,
  nis: 4, nisan: 4, apr: 4,
  may: 5, mayis: 5, mayıs: 5,
  haz: 6, haziran: 6, jun: 6,
  tem: 7, temmuz: 7, jul: 7,
  agu: 8, ağu: 8, agustos: 8, ağustos: 8, aug: 8,
  eyl: 9, eylul: 9, eylül: 9, sep: 9,
  eki: 10, ekim: 10, oct: 10,
  kas: 11, kasim: 11, kasım: 11, nov: 11,
  ara: 12, aralik: 12, aralık: 12, dec: 12,
};

export function isoTarih(ham?: string): string | undefined {
  if (!ham) return undefined;
  const s = String(ham).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);

  const m = s.match(/^(\d{1,2})\s+(\S+)\s+(\d{4})$/);
  if (!m) return undefined;

  const ay = AY_NO[m[2].toLocaleLowerCase("tr")];
  if (!ay) return undefined;

  const gun = Number(m[1]);
  if (gun < 1 || gun > 31) return undefined;

  return `${m[3]}-${String(ay).padStart(2, "0")}-${String(gun).padStart(2, "0")}`;
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
    dateModified: isoTarih(opts.guncelleme),
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
