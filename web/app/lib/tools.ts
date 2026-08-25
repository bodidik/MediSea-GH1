// Klinik hesaplayıcıların branşlara göre eşlemesi.
//
// KAYNAK ARTIK ELLE TUTULMUYOR. Bu dosya bir dönem iki liste taşıyordu:
// 34 kayıtlık `TOOLS` ve branş başına elle yazılmış `BRANCH_TOOLS`. Liste o
// 34 araçlık dönemde doğruydu; kütüphane 130 araca çıkarken güncellenmedi ve
// SESSİZCE yalana döndü.
//
// ÖLÇÜLDÜ (canlı): branş sayfasının "İlgili Hesaplayıcılar" şeridi ile
// hub'ın aynı branş kategorisi İKİ BRANŞTA HİÇ ÖRTÜŞMÜYORDU —
//
//   hematoloji : şerit wells-dvt · has-bled · glasgow-blatchford
//                hub    ipi · flipi · ipss-r · isth-dic · hscore      ortak 0
//   palyatif   : şerit ecog
//                hub    karnofsky · pps · ppi · pap-score · esas      ortak 0
//
// Yani hematoloji kütüphanesini okuyan biri, hematolojiye özgü hiçbir skora
// o sayfadan ulaşamıyordu; romatolojide 14 aracın 2'si görünüyordu.
//
// Eşleme artık `content/brans-arac.json` üzerinden geliyor ve o dosya
// `scripts/arac-metadata.cjs` tarafından hub'ın kendi kategori verisinden
// (`TOOLS_DATABASE`) ÜRETİLİYOR. `--kontrol` (CI kapısı) bayatlığı yakalıyor.
// Yeni bir araç hub'a eklendiğinde branş şeridi kendiliğinden güncelleniyor.

import bransArac from "@/content/brans-arac.json";

export type ToolRef = { slug: string; name: string; icon: string };

type BransKaydi = { kategori: string; araclar: ToolRef[] };
const VERI = bransArac as Record<string, BransKaydi>;

/** Bir branşla ilişkili hesaplayıcılar; ilişki yoksa boş dizi (bölüm gizlenir). */
export function getBranchTools(slug: string): ToolRef[] {
  return VERI[slug]?.araclar ?? [];
}

/**
 * Branşın hub kategorisi — "Tümü →" bağlantısı SÜZÜLMÜŞ listeye gitsin diye.
 *
 * Bağlantı bir dönem koşulsuz `/tools`a gidiyordu: kullanıcı branş şeridinden
 * çıkıp 130 aracın tamamıyla karşılaşıyor ve süzgeci elle bulmak zorunda
 * kalıyordu. Kategori slug'ı da üretilen dosyadan geliyor, yani şeritteki
 * araçlarla aynı kaynağa bağlı.
 */
export function getBranchToolCategory(slug: string): string | null {
  return VERI[slug]?.kategori ?? null;
}

/**
 * TERS EŞLEME: bir hesaplayıcının ilişkili olduğu branş slug'ları.
 * Araç sayfalarındaki üst gezinme çubuğundaki "branş sayfası" bağlantısı
 * bunu kullanıyor. Bir araç birden fazla branşta geçebilir (ör. curb65:
 * göğüs + enfeksiyon).
 */
export function getToolBranchSlugs(toolSlug: string): string[] {
  return Object.entries(VERI)
    .filter(([, k]) => k.araclar.some((a) => a.slug === toolSlug))
    .map(([brans]) => brans);
}
