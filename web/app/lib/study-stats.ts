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

export async function fetchServerStats(yerel: StudyNumbers): Promise<StudyNumbers> {
  try {
    const r = await fetch("/api/study");
    if (!r.ok) return yerel;
    const j = await r.json();
    if (!j.ok || !j.stat) return yerel;
    return {
      marks: j.stat.marks ?? yerel.marks,
      notes: j.stat.notes ?? yerel.notes,
      strokes: j.stat.strokes ?? yerel.strokes,
      cards: j.stat.cards ?? yerel.cards,
      due: j.stat.due ?? yerel.due,
      streak: j.stat.streak ?? yerel.streak,
      pages: j.stat.pages ?? yerel.pages,
      studiedAt: j.stat.updatedAt ?? null,
      source: "server",
    };
  } catch {
    return yerel;
  }
}
