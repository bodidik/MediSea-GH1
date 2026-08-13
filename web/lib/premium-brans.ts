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
