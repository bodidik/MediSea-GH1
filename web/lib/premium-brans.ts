import "server-only";
import fs from "fs";
import path from "path";

/**
 * Branş listesini okurken KENDİNİ ONARAN adım.
 *
 * Konular branş dosyasındaki kategoriler üzerinden listeleniyor. Diskte konu
 * dosyası olup listede adı geçmeyen bir başlık, hiçbir yerden görünmüyor:
 * ne branş sayfasında, ne panoda, ne çalışma planında.
 *
 * Ölçümde tam olarak böyle bir konu bulundu:
 *   gogus-hastaliklari/akciger-kanseri — 14 KB içerik, kendi quizi ve 87
 *   kartlık flashcard seti hazır, ama branş dosyasında listelenmemiş.
 *
 * Bitmiş ve para karşılığı sunulan içeriğin görünmez kalması, eksik
 * içerikten kötüdür. Listeyi elle düzeltmek yerine okuma adımı onarıyor;
 * konu branş dosyasına eklendiği anda bu ek kendiliğinden kayboluyor.
 */

export type PremiumKonu = {
  id: string;
  baslik: string;
  rozetler: string[];
  hazir: boolean;
};

export type PremiumKategori = {
  id: string;
  baslik: string;
  aciklama: string;
  emoji: string;
  konular: PremiumKonu[];
};

/**
 * Listede adı geçmeyen konu dosyalarını "Diğer Konular" altında toplar.
 *
 * Parametre tipi bilerek dar: yalnızca konu kimliklerine bakıyor. Pano ve
 * branş sayfası aynı veriyi farklı genişlikte tiplerle okuyor; katı bir tip
 * istemek çağıranları birbirine bağlardı.
 */
export function listelenmeyenKategori(
  branch: string,
  kategoriler: { konular?: { id: string }[] }[]
): PremiumKategori | null {
  try {
    const dizin = path.join(process.cwd(), "content", "premium", "ydus", "topics", branch);
    if (!fs.existsSync(dizin)) return null;

    const listelenen = new Set(
      (kategoriler ?? []).flatMap((kat) => (kat.konular ?? []).map((k) => k.id))
    );

    const ekstra: PremiumKonu[] = [];
    for (const dosya of fs.readdirSync(dizin).filter((f) => f.endsWith(".json"))) {
      const id = dosya.replace(/\.json$/, "");
      if (listelenen.has(id)) continue;
      try {
        const konu = JSON.parse(fs.readFileSync(path.join(dizin, dosya), "utf-8"));
        ekstra.push({
          id,
          baslik: konu?.meta?.baslik || id.replace(/-/g, " "),
          rozetler: Array.isArray(konu?.meta?.rozetler) ? konu.meta.rozetler : [],
          // Dosyası olan konu hazırdır: okunabilir içerik taşıyor.
          hazir: true,
        });
      } catch {
        // Bozuk dosya listeye girmesin.
      }
    }

    if (!ekstra.length) return null;

    return {
      id: "diger",
      baslik: "Diğer Konular",
      aciklama: "Kategoriye henüz yerleştirilmemiş başlıklar",
      emoji: "📌",
      konular: ekstra,
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */

/**
 * Açık branş slug'ı -> PREMIUM branş slug'ı (karşılığı yoksa `null`).
 *
 * ÖLÇÜLEN KUSUR: açık konu sayfalarındaki premium tanıtım şeridi bağlantıyı
 * `/tr/premium/ydus/${slug}` diye KURUYORDU, yani açık branş slug'ını
 * doğrudan kullanıyordu. İki taraf aynı kümeyi taşımıyor:
 *
 *   açık branş  : 13  (genel-dahiliye · gogus · journal-club · klinik-nutrisyon · palyatif dahil)
 *   premium branş: 9  (gogus premium tarafta `gogus-hastaliklari` adıyla duruyor)
 *
 * Sonuç canlıda ölçüldü: **24 konu sayfası 404 veren bir bağlantı**
 * gösteriyordu (klinik-nutrisyon 9 · palyatif 5 · journal-club 5 · gogus 3 ·
 * genel-dahiliye 2). Kart tıklanabilir, iddialı ve çıkmazdı.
 *
 * Varlık DOSYADAN okunuyor, bir listeden değil — premium branş eklendiğinde
 * bağlantı kendiliğinden açılıyor, bu dosyayı kimsenin güncellemesi
 * gerekmiyor. Elle tutulan tek şey ad sapması ve BİR tane:
 */
const PREMIUM_TAKMA_AD: Record<string, string> = {
  // Açık taraf "gogus", premium taraf "gogus-hastaliklari" — aynı branş.
  gogus: "gogus-hastaliklari",
};

let _premiumBranslar: Set<string> | null = null;

function premiumBranslar(): Set<string> {
  if (_premiumBranslar) return _premiumBranslar;
  try {
    const dizin = path.join(process.cwd(), "content", "premium", "ydus", "branches");
    _premiumBranslar = new Set(
      fs.readdirSync(dizin)
        .filter((f) => f.endsWith(".json"))
        .map((f) => f.slice(0, -5))
    );
  } catch {
    _premiumBranslar = new Set();
  }
  return _premiumBranslar;
}

export function premiumBransSlug(acikSlug: string): string | null {
  const aday = PREMIUM_TAKMA_AD[acikSlug] ?? acikSlug;
  return premiumBranslar().has(aday) ? aday : null;
}
