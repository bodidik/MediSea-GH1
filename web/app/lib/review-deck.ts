// C:\Users\hucig\Medknowledge\web\app\lib\review-deck.ts
//
// Vurgulardan beslenen aralıklı tekrar destesi.
//
// NEDEN AYRI BİR HAT: Depoda hâlihazırda bir "SR" iskeleti var ama çalışmıyor —
// AddToSRButton hiçbir yere yazmıyor, tekrar arayüzü yönlendirilemeyen bir
// klasörde, /api/review/stats yanlış dosya adı yüzünden 404. Üstelik o hat
// oturum + Mongo gerektiriyor. Burası tarayıcıda çalışır, giriş istemez ve
// kullanıcının zaten yaptığı işten (vurgulama) beslenir.
//
// Kart üretilmez, TÜRETİLİR: her vurgu bir karttır. Vurgu silinince kartı da
// gider. Saklanan tek şey o kartın tekrar durumudur (aralık, kolaylık, vade).

import { collectAll, type StudyEntry } from "@/app/lib/study-index";
import type { ReadingMark } from "@/app/lib/reading-marks";
import type { Stroke } from "@/app/components/StrokePreview";

const STATE_KEY = "medisea:review:v1";

export type Grade = "again" | "hard" | "good" | "easy";

/** Bir kartın tekrar durumu. Kartın kendisi vurgudan türetilir, burada durmaz. */
export type CardState = {
  /** gün cinsinden bir sonraki aralık */
  interval: number;
  /** kolaylık katsayısı (SM-2 ruhu) */
  ease: number;
  /** vade — epoch ms */
  due: number;
  /** kaç kez üst üste doğru bilindi */
  streak: number;
  /** son görülme */
  seen: number;
};

/**
 * İki kart tipi:
 *  cloze  — vurguladığın cümle boşluğa dönüşür, bağlamdan hatırlarsın
 *  sketch — o konuda kendi çizdiğin şemayı hatırlarsın (çevirince çizim çıkar)
 */
export type CardKind = "cloze" | "sketch";

export type ReviewCard = {
  id: string;
  kind: CardKind;
  path: string;
  title: string;
  branch: string;
  /** cloze: vurgulanan metin — cevap budur */
  answer: string;
  /** cloze: öncesi/sonrası bağlam — soru bundan kurulur */
  before: string;
  after: string;
  /** sketch: el yazısı vuruşları */
  strokes?: Stroke[];
  state: CardState | null;
};

const FRESH: CardState = { interval: 0, ease: 2.5, due: 0, streak: 0, seen: 0 };

/* ── Durum deposu ──────────────────────────────────────────────────────── */

function readStates(): Record<string, CardState> {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    const v = raw ? JSON.parse(raw) : null;
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

function writeStates(s: Record<string, CardState>) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(s));
  } catch {
    // kota dolu — tekrar durumu kaybolur ama vurgular sağlam kalır
  }
}

/* ── Deste ─────────────────────────────────────────────────────────────── */

/** Vurgusu yeterince uzun olanlar karta dönüşür; tek kelimelik vurgu soru olmaz. */
function usable(m: ReadingMark): boolean {
  const t = m.t.trim();
  return t.length >= 8 && t.length <= 400;
}

function clozeCard(e: StudyEntry, m: ReadingMark, states: Record<string, CardState>): ReviewCard {
  return {
    id: m.id,
    kind: "cloze",
    path: e.path,
    title: e.title,
    branch: e.branch,
    answer: m.t.replace(/\s+/g, " ").trim(),
    before: (m.b ?? "").trim(),
    after: (m.a ?? "").trim(),
    state: states[m.id] ?? null,
  };
}

/** Çizim kartı id'si — vurgu id'leriyle çakışmaz (onlar 8 karakterlik rastgele). */
export function sketchId(path: string) {
  return `sketch:${path}`;
}

function sketchCard(e: StudyEntry, states: Record<string, CardState>): ReviewCard | null {
  const strokes = (e.note?.strokes ?? []) as Stroke[];
  // birkaç çizgilik karalama kart olmaya değmez
  if (strokes.length < 3) return null;
  const id = sketchId(e.path);
  return {
    id,
    kind: "sketch",
    path: e.path,
    title: e.title,
    branch: e.branch,
    answer: "",
    before: "",
    after: "",
    strokes,
    state: states[id] ?? null,
  };
}

/** Vurgulardan ve el çizimlerinden türetilmiş deste. */
export function buildDeck(): ReviewCard[] {
  const states = readStates();
  const out: ReviewCard[] = [];
  for (const e of collectAll()) {
    for (const m of e.marks) {
      if (usable(m)) out.push(clozeCard(e, m, states));
    }
    const sk = sketchCard(e, states);
    if (sk) out.push(sk);
  }
  return out;
}

/** Vadesi gelmiş + hiç çalışılmamış kartlar, en gecikmişten başlayarak. */
export function dueCards(deck: ReviewCard[], now = Date.now()): ReviewCard[] {
  return deck
    .filter((c) => !c.state || c.state.due <= now)
    .sort((a, b) => {
      // önce vadesi geçmişler, sonra hiç çalışılmamışlar
      const ad = a.state?.due ?? Infinity;
      const bd = b.state?.due ?? Infinity;
      return ad - bd;
    });
}

export type DeckStats = {
  toplam: number;
  yeni: number;
  vadesi: number;
  ogrenilen: number;
  yarin: number;
};

export function deckStats(deck: ReviewCard[], now = Date.now()): DeckStats {
  const gun = 86_400_000;
  return {
    toplam: deck.length,
    yeni: deck.filter((c) => !c.state).length,
    vadesi: deck.filter((c) => c.state && c.state.due <= now).length,
    ogrenilen: deck.filter((c) => (c.state?.streak ?? 0) >= 2).length,
    yarin: deck.filter((c) => c.state && c.state.due > now && c.state.due <= now + gun).length,
  };
}

/* ── Zamanlama ─────────────────────────────────────────────────────────── */

/**
 * SM-2'nin sadeleştirilmiş hali. Dört düğme, dört davranış:
 *  again → sıfırla, aynı oturumda tekrar sor
 *  hard  → aralığı çok az büyüt, kolaylığı düşür
 *  good  → normal büyüme
 *  easy  → sıçrat
 */
export function schedule(prev: CardState | null, grade: Grade, now = Date.now()): CardState {
  const s = prev ?? FRESH;
  const gun = 86_400_000;
  let { interval, ease, streak } = s;

  if (grade === "again") {
    ease = Math.max(1.3, ease - 0.2);
    interval = 0;
    streak = 0;
    // 10 dakika sonra yeniden — oturum içinde geri gelsin
    return { interval, ease, streak, seen: now, due: now + 10 * 60_000 };
  }

  if (grade === "hard") {
    ease = Math.max(1.3, ease - 0.15);
    interval = interval <= 0 ? 1 : Math.max(1, Math.round(interval * 1.2));
  } else if (grade === "good") {
    interval = interval <= 0 ? 1 : interval === 1 ? 3 : Math.round(interval * ease);
  } else {
    ease = Math.min(3.0, ease + 0.15);
    interval = interval <= 0 ? 3 : Math.round(interval * ease * 1.3);
  }

  interval = Math.min(365, Math.max(1, interval));
  streak += 1;
  return { interval, ease, streak, seen: now, due: now + interval * gun };
}

/** Bir kartın notunu kaydeder ve yeni durumunu döndürür. */
export function grade(cardId: string, g: Grade, now = Date.now()): CardState {
  const states = readStates();
  const next = schedule(states[cardId] ?? null, g, now);
  states[cardId] = next;
  writeStates(states);
  return next;
}

/** Artık var olmayan vurguların tekrar durumunu temizler. */
export function pruneStates(deck: ReviewCard[]) {
  const alive = new Set(deck.map((c) => c.id));
  const states = readStates();
  let changed = false;
  for (const id of Object.keys(states)) {
    if (!alive.has(id)) {
      delete states[id];
      changed = true;
    }
  }
  if (changed) writeStates(states);
}

/** İnsan okunur vade metni. */
export function dueLabel(state: CardState | null, now = Date.now()): string {
  if (!state) return "yeni";
  const fark = state.due - now;
  if (fark <= 0) return "şimdi";
  const dk = Math.round(fark / 60_000);
  if (dk < 60) return `${dk} dk`;
  const saat = Math.round(dk / 60);
  if (saat < 24) return `${saat} sa`;
  return `${Math.round(saat / 24)} gün`;
}
