// Profil ve premium sayfalarının ortak veri kaynağı.
// localStorage'dan çalışma sayaçlarını toplar, oturum varsa sunucudan günceller.

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

export function localStats(): StudyNumbers {
  let marks = 0;
  let noteCount = 0;
  let strokeCount = 0;
  const pages = new Set<string>();

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith("medisea:marks:v2:")) {
        const v = JSON.parse(localStorage.getItem(k)!);
        if (Array.isArray(v)) { marks += v.length; pages.add(k); }
      } else if (k.startsWith("medisea:notes:v1:")) {
        const v = JSON.parse(localStorage.getItem(k)!);
        if (v?.text?.trim() || v?.strokes?.length) {
          noteCount++;
          strokeCount += v.strokes?.length ?? 0;
          pages.add(k);
        }
      }
    }
  } catch {}

  let cards = 0;
  let due = 0;
  try {
    const raw = localStorage.getItem("medisea:review:v1");
    const review = raw ? JSON.parse(raw) : {};
    cards = Object.keys(review).length;
    const now = Date.now();
    due = Object.values(review).filter((s: any) => !s || (s.due ?? 0) <= now).length;
  } catch {}

  let streak = 0;
  try {
    const raw = localStorage.getItem("medisea:log:v1");
    const log = raw ? JSON.parse(raw) : {};
    const dk = (d: Date) => {
      const p = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    };
    const d = new Date();
    if (!log[dk(d)]?.kart) d.setDate(d.getDate() - 1);
    while (log[dk(d)]?.kart) { streak++; d.setDate(d.getDate() - 1); }
  } catch {}

  return { marks, notes: noteCount, strokes: strokeCount, cards, due, streak, pages: pages.size, studiedAt: null, source: "local" };
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
