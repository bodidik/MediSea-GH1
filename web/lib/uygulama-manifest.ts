import type { MetadataRoute } from "next";
import { SITE_ADI, SITE_ACIKLAMA } from "@/lib/site";
import { MARKA_LACIVERT } from "@/lib/marka-isareti";

/**
 * "ANA EKRANA EKLE" — site ve her hesaplayıcı kendi manifestiyle kurulur.
 *
 * Neden araç başına ayrı manifest: Chrome (Android) kurulabilir bir sitede
 * menüde "Uygulamayı yükle" gösteriyor ve kurulan simge manifestin
 * `start_url`ine açılıyor. Tek bir site manifesti olsaydı BMI sayfasından
 * kurulan simge ana sayfaya açılırdı — hekimin istediği, tek dokunuşla
 * AYNI hesaplayıcıya dönmek. Her araç sayfası bu yüzden kendi manifestini
 * bağlıyor (`scripts/arac-metadata.cjs` → `metadata.manifest`); `id` ayrı
 * olduğu için Android her birini ayrı simge olarak kurar.
 *
 * `scope` aracın kendi yolu: kapsam dışına (kütüphane, başka araç) giden
 * bağlantı aynı pencerede açılır ama üstte adres şeridi görünür — kullanıcı
 * uygulamanın dışına çıktığını bilir.
 *
 * Service worker YOK, bilerek: Chrome artık kurulum için şart koşmuyor ve
 * araçlar zaten sıfır ağla çalışıyor. Önbellek katmanı eklemek bayat içerik
 * riskini getirir; ölçülmüş bir ihtiyaç değil.
 */
export const SIMGELER: MetadataRoute.Manifest["icons"] = [
  { src: "/ikon/192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/ikon/512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/ikon/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
];

const ORTAK = {
  display: "standalone",
  lang: "tr",
  dir: "ltr",
  theme_color: MARKA_LACIVERT,
  // Açılış ekranı zemini — sayfa gövdesiyle aynı (bg-slate-50).
  background_color: "#f8fafc",
  icons: SIMGELER,
} satisfies Partial<MetadataRoute.Manifest>;

export function siteManifesti(): MetadataRoute.Manifest {
  return {
    ...ORTAK,
    id: "/",
    name: `${SITE_ADI} — İç hastalıkları klinik kaynak`,
    short_name: SITE_ADI,
    description: SITE_ACIKLAMA,
    start_url: "/",
    scope: "/",
    categories: ["medical", "education"],
    /* Simgeye uzun basınca çıkan kısayollar (Android en fazla 4 gösterir). */
    shortcuts: [
      { name: "Klinik Hesaplayıcılar", short_name: "Hesaplayıcılar", url: "/tools", icons: [SIMGELER[0]] },
      { name: "Kütüphane", url: "/topics", icons: [SIMGELER[0]] },
      { name: "Tekrar", url: "/tekrar", icons: [SIMGELER[0]] },
      { name: "Çalışma Alanım", url: "/calisma-alanim", icons: [SIMGELER[0]] },
    ],
  };
}

/**
 * Ana ekran etiketi kısa olmalı (başlatıcı ~12 karakterden sonra kesiyor):
 * "4T Skoru — HIT" → "4T Skoru", "Asit-Baz Analizi (ABG)" → "Asit-Baz Analizi".
 * Tam ad `name`de duruyor; kurulum penceresinde o görünür.
 */
export function kisaAd(ad: string): string {
  const k = ad.split(/\s[—–(]|\s-\s|:/)[0].trim();
  return k || ad;
}

export function aracManifesti(arac: { slug: string; name: string; desc: string }): MetadataRoute.Manifest {
  const yol = `/tools/${arac.slug}`;
  return {
    ...ORTAK,
    id: yol,
    name: arac.name,
    short_name: kisaAd(arac.name),
    description: arac.desc,
    start_url: yol,
    scope: yol,
    categories: ["medical"],
  };
}
