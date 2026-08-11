/**
 * MediSEA Reklam & Duyuru Yapılandırması
 *
 * tags[] → Bu reklamın gösterileceği tool slug'ları veya kategori anahtarları.
 *           Boş dizi [] = siteye geneli (fallback).
 *           Birden fazla etiket → herhangi biri eşleşirse göster.
 *
 * priority → Yüksek değer önce gösterilir. Aynı öncelikte rastgele seçilir.
 *
 * type:
 *   "self"         → MediSEA kendi tanıtımı (varsayılan fallback)
 *   "announcement" → Duyuru (kurs açılışı, güncelleme vs.)
 *   "feature"      → Özellik tanıtımı (yeni araç, içerik)
 *   "promo"        → Promosyon / kitap / ürün
 *
 * active: false → geçici olarak devre dışı bırak
 */

export type AdItem = {
  id: string;
  tags: string[];        // tool slug veya kategori keyword; [] = genel
  priority: number;
  active?: boolean;
  type: "self" | "announcement" | "feature" | "promo";
  badge?: string;
  emoji: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
  accent: string;        // Tailwind renk sınıfı (bg-*/border-*/text-*)
};

const ADS: AdItem[] = [

  // ── GENEL / FALLBACK ─────────────────────────────────────────────────────
  {
    id: "medisea-premium",
    tags: [],
    priority: 1,
    type: "self",
    emoji: "🌊",
    badge: "MediSEA Premium",
    title: "Tüm içeriklere sınırsız erişin",
    body: "Soru bankası, vaka analizleri, konu özetleri ve 200+ klinik hesaplayıcı — tek abonelikte.",
    cta: { label: "Premium'u keşfet →", href: "/premium" },
    accent: "blue",
  },
  {
    id: "medisea-araçlar",
    tags: [],
    priority: 1,
    type: "feature",
    emoji: "🧮",
    badge: "Yeni",
    title: "200+ Klinik Hesaplayıcı",
    body: "Skorlama, ilaç dozu, idrar analizleri, asit-baz, nütrisyon indeksleri ve daha fazlası — ücretsiz.",
    cta: { label: "Araçlara git →", href: "/tools" },
    accent: "indigo",
  },
  {
    id: "medisea-genel-tanitim",
    tags: [],
    priority: 1,
    type: "self",
    emoji: "📚",
    badge: "MediSEA",
    title: "Tıp eğitiminde yeni nesil platform",
    body: "Güncel kılavuzlar, klinik vaka tartışmaları ve kanıta dayalı içeriklerle ders çalışmanın en akıllı yolu.",
    cta: { label: "Hemen başla →", href: "/" },
    accent: "blue",
  },

  // ── KARDİYOLOJİ ──────────────────────────────────────────────────────────
  {
    id: "kardiyoloji-konu",
    tags: ["chads-vasc", "has-bled", "heart-score", "timi-ua", "grace", "endocarditis", "wells-pe", "wells-dvt", "perc", "padua"],
    priority: 3,
    type: "feature",
    emoji: "❤️",
    badge: "Kardiyoloji",
    title: "Kapsamlı KVH Konu Özetleri",
    body: "AF yönetiminden AKS protokollerine, güncel ESC kılavuzları ışığında hazırlanmış pratik özet notlar.",
    cta: { label: "Kardiyoloji konuları →", href: "/topics/kardiyoloji" },
    accent: "rose",
  },

  // ── NEFROLOJİ ─────────────────────────────────────────────────────────────
  {
    id: "nefroloji-konu",
    tags: ["egfr", "kdigo-aki", "sodium", "abg", "ktv", "osmolal-gap", "spot-urine", "corrected-calcium", "anion-gap"],
    priority: 3,
    type: "feature",
    emoji: "🫘",
    badge: "Nefroloji",
    title: "Nefroloji Algoritmaları",
    body: "AKI, CKD evrelemesi, sıvı-elektrolit bozuklukları ve asit-baz dengesi — adım adım klinik yaklaşım.",
    cta: { label: "Nefroloji konuları →", href: "/topics/nefroloji" },
    accent: "sky",
  },

  // ── ROMATOLOJİ ────────────────────────────────────────────────────────────
  {
    id: "romatoloji-konu",
    tags: ["cdai", "sdai", "haq-di", "basdai", "asdas", "dapsa", "fibromiyalji"],
    priority: 3,
    type: "feature",
    emoji: "🦴",
    badge: "Romatoloji",
    title: "Romatoloji Hastalık Aktivite Kılavuzu",
    body: "RA, AS, PsA ve fibromiyalji — hastalık aktivitesi hesaplamaları ve tedavi hedefleri.",
    cta: { label: "Romatoloji konuları →", href: "/topics/romatoloji" },
    accent: "amber",
  },

  // ── ENDOKRİNOLOJİ ────────────────────────────────────────────────────────
  {
    id: "endokrin-konu",
    tags: ["ogtt", "homa-ir", "tsh-frakt", "tft", "gh-test", "tirads"],
    priority: 3,
    type: "feature",
    emoji: "🦋",
    badge: "Endokrinoloji",
    title: "Tiroid & Metabolizma Özetleri",
    body: "Tiroid nodülü değerlendirme, DM tanı kriterleri, insülin direnci — güncel ADA/ETA kılavuzlarıyla.",
    cta: { label: "Endokrinoloji konuları →", href: "/topics/endokrinoloji" },
    accent: "purple",
  },

  // ── KLİNİK NÜTRİSYON ────────────────────────────────────────────────────
  {
    id: "nutrisyon-konu",
    tags: ["must", "sga", "conut", "pni", "gnri", "refeeding-risk"],
    priority: 3,
    type: "feature",
    emoji: "🥗",
    badge: "Klinik Nütrisyon",
    title: "Malnütrisyon Tarama & Değerlendirme",
    body: "MUST, SGA, GNRI, PNI — beslenme desteği endikasyonları ve refeeding sendromu önleme protokolleri.",
    cta: { label: "Nütrisyon konuları →", href: "/topics/klinik-nutrisyon" },
    accent: "green",
  },

  // ── ACİL & KRİTİK ────────────────────────────────────────────────────────
  {
    id: "acil-konu",
    tags: ["qsofa", "news2", "gcs", "ciwa-ar", "4t-hit", "wells-pe", "wells-dvt", "perc"],
    priority: 3,
    type: "feature",
    emoji: "🚨",
    badge: "Acil Tıp",
    title: "Acil Yaklaşım Algoritmaları",
    body: "Sepsis, PE, alkol yoksunluğu, HIT — triage'dan tedaviye pratik karar destek akışları.",
    cta: { label: "Acil Tıp konuları →", href: "/topics/acil-tip" },
    accent: "red",
  },

  // ── ÖRNEK: KİTAP / ÜRÜN DUYURUSU (aktif değil, şablon) ──────────────────
  {
    id: "kitap-ornek",
    tags: [],
    priority: 10,
    active: false,
    type: "promo",
    emoji: "📖",
    badge: "Yeni Yayın",
    title: "Klinik Hesaplamalar El Kitabı",
    body: "200+ formül, 50+ skorlama sistemi — cebinizde taşıyabileceğiniz başvuru kaynağı. Ön sipariş açık.",
    cta: { label: "Ön sipariş ver →", href: "/kitap" },
    accent: "amber",
  },

];

export default ADS;

// ── Yardımcı: Verilen slug için en uygun aktif reklamı seç ───────────────
export function pickAd(toolSlug: string): AdItem {
  const active = ADS.filter(a => a.active !== false);

  // Önce slug'a özel eşleşenleri kontrol et
  const targeted = active
    .filter(a => a.tags.length > 0 && a.tags.includes(toolSlug))
    .sort((a, b) => b.priority - a.priority);

  if (targeted.length > 0) {
    // Aynı öncelikte birden fazla varsa rastgele birini seç
    const topPriority = targeted[0].priority;
    const topGroup = targeted.filter(a => a.priority === topPriority);
    return topGroup[Math.floor(Math.random() * topGroup.length)];
  }

  // Fallback: genel reklamlar (tags: [])
  const general = active.filter(a => a.tags.length === 0);
  return general[Math.floor(Math.random() * general.length)] ?? ADS[0];
}
