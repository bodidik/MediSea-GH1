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
  /** Konu başka branşın dosyasındaysa o branş (çapraz bağlantı). */
  brans?: string;
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
 * "YENİ" ROZETİ BEYAN EDİLMEZ, `guncelleme`DEN TÜRER.
 *
 * Rozet içerik dosyalarına elle yazılıyordu ve ölçüldü: 67 konunun 65'inde
 * vardı (branş listesinde 64). Her şeye basılan rozet hiçbir şeyi ayırt
 * etmiyor ve zamanla düşmüyor — "zamana bağlı değeri saklama" sınıfı. Üstelik
 * iki ayrı kaynaktan okunuyordu: branş listesi `branches/<b>.json`daki
 * kopyayı, konu sayfası konu dosyasını; 36 konuda ikisi birbirini tutmuyordu.
 *
 * Kural panonun "Yeni eklendi" kuralıyla AYNI (orada gerekçesi yazılı):
 * yalnızca EN YENİ `guncelleme` ayına ait konu yenidir. Ay hassasiyetinden
 * daha incesi dosyada yok; dosya değişiklik zamanı ise derlemede sıfırlanıyor.
 */
export const YENI_ROZETI = "YENİ";

const AY_DESENI = /^(\d{4})-(0[1-9]|1[0-2])/;

/** `guncelleme` alanından `YYYY-AA`; geçersizse `null`. */
export function guncellemeAyi(deger: unknown): string | null {
  if (typeof deger !== "string") return null;
  const m = AY_DESENI.exec(deger);
  return m ? `${m[1]}-${m[2]}` : null;
}

let _enYeniAy: string | null | undefined;

/** Bütün premium konu dosyalarındaki en yeni `guncelleme` ayı. */
export function premiumEnYeniAy(): string | null {
  if (_enYeniAy !== undefined) return _enYeniAy;
  let enYeni: string | null = null;
  try {
    const kok = path.join(process.cwd(), "content", "premium", "ydus", "topics");
    for (const brans of fs.readdirSync(kok)) {
      const dizin = path.join(kok, brans);
      if (!fs.statSync(dizin).isDirectory()) continue;
      for (const dosya of fs.readdirSync(dizin)) {
        if (!dosya.endsWith(".json")) continue;
        try {
          const ay = guncellemeAyi(JSON.parse(fs.readFileSync(path.join(dizin, dosya), "utf-8"))?.meta?.guncelleme);
          if (ay && (!enYeni || ay > enYeni)) enYeni = ay;
        } catch {
          // Bozuk dosya en yeni ayı belirleyemez.
        }
      }
    }
  } catch {
    enYeni = null;
  }
  _enYeniAy = enYeni;
  return enYeni;
}

/**
 * Ekrana basılacak rozetler: beyan edilen "YENİ" atılır, konu en yeni aya
 * aitse başa eklenir. Öteki rozetler beyan sırasıyla kalır.
 */
export function gorunenRozetler(beyan: unknown, guncelleme: unknown): string[] {
  const liste = Array.isArray(beyan)
    ? beyan.filter((r): r is string => typeof r === "string" && r !== YENI_ROZETI)
    : [];
  const ay = guncellemeAyi(guncelleme);
  const enYeni = premiumEnYeniAy();
  return ay && enYeni && ay === enYeni ? [YENI_ROZETI, ...liste] : liste;
}

/**
 * Branş listesindeki bir konunun rozetleri. Konu dosyası VARSA rozet oradan
 * okunur (konu sayfasıyla tek kaynak); yoksa branş listesindeki beyan
 * kullanılır ama "YENİ" düşer — var olmayan içerik yeni olamaz.
 */
export function listeRozetleri(brans: string, konuId: string, beyan: unknown): string[] {
  try {
    const dosya = path.join(process.cwd(), "content", "premium", "ydus", "topics", brans, `${konuId}.json`);
    if (fs.existsSync(dosya)) {
      const meta = JSON.parse(fs.readFileSync(dosya, "utf-8"))?.meta;
      return gorunenRozetler(meta?.rozetler, meta?.guncelleme);
    }
  } catch {
    // Okunamayan dosya: beyana düş.
  }
  return gorunenRozetler(beyan, null);
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
