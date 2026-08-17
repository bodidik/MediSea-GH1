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

/**
 * Vurgusu yeterince uzun olanlar karta dönüşür; tek kelimelik vurgu soru olmaz.
 *
 * `m.t` tipte ZORUNLU ama burada yine de savunmacı okunuyor. Sebebi ölçüldü:
 * alanı eksik TEK bir kayıt `m.t.trim()` üzerinde patlıyor ve bütün tekrar
 * sayfası "Tekrar sayfası yüklenemedi" hata kartına düşüyordu — kullanıcının
 * aylarca biriktirdiği bütün kartlar tek bozuk kayıt yüzünden erişilemez
 * hale geliyordu.
 *
 * Bu, depodaki yerleşik ilkeye aykırıydı: konu sayfasında "bozuk TEK bir
 * içerik dosyası bütün rotayı 500'e düşürmemeli" diye yazılı. Aynı mantık
 * burada da geçerli, üstelik risk daha yüksek — vurgular yedekten ya da
 * başka bir cihazdan geri yüklenebiliyor.
 *
 * `b` ve `a` alanları zaten `?? ""` ile korunuyordu; eksik olan yalnızca
 * `t` idi. Bozuk kayıt artık "kullanılamaz" sayılıp atlanıyor, ötekiler
 * çalışmaya devam ediyor.
 */
function usable(m: ReadingMark): boolean {
  const t = typeof m?.t === "string" ? m.t.trim() : "";
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
export function dueCards(deck: ReviewCard[], branch: string | null = null, now = Date.now()): ReviewCard[] {
  return deck
    .filter((c) => !branch || (c.branch || "Diğer") === branch)
    .filter((c) => !c.state || c.state.due <= now)
    .sort((a, b) => {
      // önce vadesi geçmişler, sonra hiç çalışılmamışlar
      const ad = a.state?.due ?? Infinity;
      const bd = b.state?.due ?? Infinity;
      return ad - bd;
    });
}

/** Destedeki branşlar ve her birinin kart sayıları. */
export type BranchRow = { branch: string; toplam: number; vadesi: number };

export function branchesOf(deck: ReviewCard[], now = Date.now()): BranchRow[] {
  const map = new Map<string, BranchRow>();
  for (const c of deck) {
    const b = c.branch || "Diğer";
    const row = map.get(b) ?? { branch: b, toplam: 0, vadesi: 0 };
    row.toplam++;
    if (!c.state || c.state.due <= now) row.vadesi++;
    map.set(b, row);
  }
  return [...map.values()].sort((a, b) => b.vadesi - a.vadesi || b.toplam - a.toplam);
}

/**
 * Tazeleme kipi: takvimi yok sayar, seçilen branşın TÜM kartlarını karıştırır.
 * Sınav öncesi bir branşı baştan sona geçmek için. Bu kipte verilen notlar
 * takvimi DEĞİŞTİRMEZ — yoksa sınav gecesi yapılan bir tur, aylardır oturmuş
 * tekrar aralıklarını sıfırlardı.
 */
export function cramCards(deck: ReviewCard[], branch: string | null): ReviewCard[] {
  const list = deck.filter((c) => !branch || (c.branch || "Diğer") === branch);
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
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
    // ŞU AN ÇALIŞILABİLİR olanlar — dueCards() ile aynı ölçüt.
    // Daha önce yalnızca takvimi geçmişleri sayıyordu; o zaman hiç çalışılmamış
    // kartlar sayılmıyor, taze vurgusu olan kullanıcıya "yapılacak iş yok" gibi
    // görünüyordu.
    vadesi: deck.filter((c) => !c.state || c.state.due <= now).length,
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
  if (typeof window !== "undefined") window.dispatchEvent(new Event("medisea:changed"));
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

/* ── Çalışma günlüğü ───────────────────────────────────────────────────── */

const LOG_KEY = "medisea:log:v1";

/** Gün başına: kaç kart çalışıldı, kaçı bilindi. */
export type DayLog = { kart: number; dogru: number };
export type StudyLog = Record<string, DayLog>;

/** Yerel tarih anahtarı (UTC değil — kullanıcının günü neredeyse orası). */
export function dayKey(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function readLog(): StudyLog {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    const v = raw ? JSON.parse(raw) : null;
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

/** Bir kart çalışıldığını günlüğe işler. */
export function logStudy(dogru: boolean) {
  try {
    const log = readLog();
    const k = dayKey();
    const g = log[k] ?? { kart: 0, dogru: 0 };
    g.kart++;
    if (dogru) g.dogru++;
    log[k] = g;

    // 120 günden eskisini at — günlük sınırsız büyümesin
    const sinir = dayKey(new Date(Date.now() - 120 * 86_400_000));
    for (const gun of Object.keys(log)) if (gun < sinir) delete log[gun];

    localStorage.setItem(LOG_KEY, JSON.stringify(log));
  } catch {
    // kota dolu — günlük süs, çalışmayı engellememeli
  }
}

/**
 * Kesintisiz çalışma günü sayısı. Bugün henüz çalışılmadıysa dünden geriye
 * sayar (gün bitmeden seriyi kırılmış göstermek moral bozar).
 */
export function streakOf(log: StudyLog, now = new Date()): number {
  let n = 0;
  const d = new Date(now);
  if (!log[dayKey(d)]?.kart) d.setDate(d.getDate() - 1);
  while (log[dayKey(d)]?.kart) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Son N günün etkinliği, eskiden yeniye. */
export function recentDays(log: StudyLog, n = 14, now = new Date()) {
  const out: { gun: string; kart: number; dogru: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    out.push({ gun: k, kart: log[k]?.kart ?? 0, dogru: log[k]?.dogru ?? 0 });
  }
  return out;
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
