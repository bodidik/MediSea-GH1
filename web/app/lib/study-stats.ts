// Profil ve premium sayfalarının ortak veri kaynağı.
// localStorage'dan çalışma sayaçlarını toplar, oturum varsa sunucudan günceller.

import { readAll, type Backup } from "@/app/lib/study-backup";
import { streakOf } from "@/app/lib/review-deck";

export type StudyNumbers = {
  marks: number;
  notes: number;
  strokes: number;
  cards: number;
  due: number;
  streak: number;
  pages: number;
  studiedAt: string | null;
  source: "server" | "local";
};

const BOS: StudyNumbers = {
  marks: 0, notes: 0, strokes: 0, cards: 0, due: 0, streak: 0,
  pages: 0, studiedAt: null, source: "local",
};

/**
 * Yedek nesnesinden sayaçlar. Sunucuya gönderilen sayaçlar da, ekranda
 * gösterilenler de buradan çıkar — ikisi ayrı hesaplanırsa kaçınılmaz olarak
 * ayrışır ve kullanıcı senkron sonrası "değişen" rakamlar görür.
 */
export function countsOf(b: Backup, now = Date.now()): StudyNumbers {
  // Sayfa: YOL'a göre tekil. Anahtara göre sayılırsa hem vurgulanmış hem not
  // alınmış bir sayfa iki ayrı anahtar taşıdığı için iki kez sayılır.
  const pages = new Set([...Object.keys(b.marks), ...Object.keys(b.notes)]);

  return {
    marks: Object.values(b.marks).reduce((n, a) => n + a.length, 0),
    notes: Object.keys(b.notes).length,
    strokes: Object.values(b.notes).reduce((n, d) => n + (d.strokes?.length ?? 0), 0),
    cards: Object.keys(b.review).length,
    due: Object.values(b.review).filter((s) => !s || (s.due ?? 0) <= now).length,
    streak: streakOf(b.log),
    pages: pages.size,
    studiedAt: null,
    source: "local",
  };
}

export function localStats(): StudyNumbers {
  try {
    return countsOf(readAll());
  } catch {
    return { ...BOS };
  }
}

/**
 * ZAMANA BAĞLI DEĞER SUNUCUDAN OKUNMAZ — çünkü sunucudaki bir ANLIK GÖRÜNTÜ.
 *
 * `streak` ve `due` `now`'un fonksiyonu; ikisi de push anında hesaplanıp
 * `StudyStat`a yazılıyor (`study-sync.buildPayload` → `countsOf`). Bu sayfa
 * onları geri okuyup YEREL hesabın üstüne yazıyordu, yani ekrandaki değer
 * "son senkron anındaki" değerdi.
 *
 * Gerçek modüller sürülerek ölçüldü (aynı veri, iki farklı `now`):
 *
 *   7 gün üst üste çalışılmış, sonra 3 gün ara verilmiş bir günlük
 *     push anında  streakOf -> 7
 *     BUGÜN        streakOf -> 0        <- sunucu hâlâ 7 diyor
 *   vadesi yarın olan tek kart
 *     bugün        due -> 0
 *     2 gün sonra  due -> 1             <- sunucu hâlâ 0 diyor
 *
 * Yani seri kullanıcının kendi davranışı hakkında YANLIŞ bir iddiaya
 * dönüşüyor (bırakılmış bir seri günlerce "devam ediyor" görünüyor) ve
 * bekleyen kart sayısı olduğundan AZ gösteriliyor.
 *
 * Biriken sayaçlar (marks/notes/strokes/cards/pages) sunucudan alınmaya devam
 * ediyor: onlar `now`a bağlı değil ve BAŞKA BİR CİHAZDA artmış olabilir.
 * Zamana bağlı iki değer ise yerel veriden yeniden hesaplanıyor.
 *
 * SINIR — bilerek: yerelde hiç veri yoksa (yeni cihaz, uzlaşma henüz
 * yapılmamış) yerel hesap 0 döner ve bu, sunucudaki bayat değerden daha
 * yanıltıcı olurdu. O durumda sunucu değerine düşülüyor; uzlaşma indikten
 * sonraki ilk okumada yerel hesap devralıyor.
 */
export async function fetchServerStats(yerel: StudyNumbers): Promise<StudyNumbers> {
  try {
    const r = await fetch("/api/study");
    if (!r.ok) return yerel;
    const j = await r.json();
    if (!j.ok || !j.stat) return yerel;
    const yerelVeriVar = yerel.pages > 0 || yerel.cards > 0;
    return {
      marks: j.stat.marks ?? yerel.marks,
      notes: j.stat.notes ?? yerel.notes,
      strokes: j.stat.strokes ?? yerel.strokes,
      cards: j.stat.cards ?? yerel.cards,
      due: yerelVeriVar ? yerel.due : (j.stat.due ?? yerel.due),
      streak: yerelVeriVar ? yerel.streak : (j.stat.streak ?? yerel.streak),
      pages: j.stat.pages ?? yerel.pages,
      studiedAt: j.stat.updatedAt ?? null,
      source: "server",
    };
  } catch {
    return yerel;
  }
}
