// C:\Users\hucig\Medknowledge\web\app\lib\study-index.ts
//
// Vurgular ve notlar sayfa yoluna göre ayrı ayrı saklanır. Bu dosya onları
// tek bir listede toplar — "Çalışma Alanım" sayfası buradan beslenir.
//
// Varlık bilgisi depo anahtarları TARANARAK bulunur, dizinden değil; dizin
// yalnızca başlık gibi süsleri taşır. Böylece dizin eksik/bozuk olsa bile
// kullanıcının notu kaybolmuş görünmez.

import type { ReadingMark } from "@/app/lib/reading-marks";

const MARK_PREFIX = "medisea:marks:v2:";
const NOTE_PREFIX = "medisea:notes:v1:";
const INDEX_KEY = "medisea:index:v1";

export type NoteDoc = { text: string; strokes: { c: string; w: number; p: [number, number, number][] }[] };

export type StudyEntry = {
  path: string;
  title: string;
  branch: string;
  marks: ReadingMark[];
  note: NoteDoc | null;
  at: number;
};

type IndexRow = { title: string; at: number };

/* ── Dizin ─────────────────────────────────────────────────────────────── */

function readIndex(): Record<string, IndexRow> {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    const v = raw ? JSON.parse(raw) : null;
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

/** Sayfada bir şey kaydedildiğinde başlığı ve zamanı dizine işler. */
export function touchIndex(path: string, title: string) {
  try {
    const idx = readIndex();
    idx[path] = { title, at: Date.now() };
    localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
  } catch {
    // kota dolu — dizin süs, kaybı içeriği etkilemez
  }
}

function dropFromIndex(path: string) {
  try {
    const idx = readIndex();
    delete idx[path];
    localStorage.setItem(INDEX_KEY, JSON.stringify(idx));
  } catch {}
}

/** Sayfanın okunabilir başlığını DOM'dan çıkarır. */
export function pageTitle(): string {
  const h1 = document.querySelector("h1")?.textContent?.trim();
  if (h1 && h1.length > 1 && h1.length < 140) return h1;
  const doc = (document.title || "").split("|")[0].trim();
  return doc || location.pathname;
}

/* ── Toplama ───────────────────────────────────────────────────────────── */

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Depodaki tüm not ve vurguları tek listede, en yeni önce döndürür. */
export function collectAll(): StudyEntry[] {
  const idx = readIndex();
  const paths = new Set<string>();

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k.startsWith(MARK_PREFIX)) paths.add(k.slice(MARK_PREFIX.length));
    else if (k.startsWith(NOTE_PREFIX)) paths.add(k.slice(NOTE_PREFIX.length));
  }

  const out: StudyEntry[] = [];
  for (const path of paths) {
    const marks = parseJson<ReadingMark[]>(localStorage.getItem(MARK_PREFIX + path)) ?? [];
    const note = parseJson<NoteDoc>(localStorage.getItem(NOTE_PREFIX + path));

    const hasNote = Boolean(note && (note.text?.trim() || note.strokes?.length));
    if (!marks.length && !hasNote) continue;

    out.push({
      path,
      title: idx[path]?.title || prettify(path),
      branch: branchOf(path),
      marks,
      note: hasNote ? note : null,
      at: idx[path]?.at ?? 0,
    });
  }

  return out.sort((a, b) => b.at - a.at);
}

/** Bir sayfanın tüm çalışma verisini siler. */
export function purge(path: string) {
  try {
    localStorage.removeItem(MARK_PREFIX + path);
    localStorage.removeItem(NOTE_PREFIX + path);
  } catch {}
  dropFromIndex(path);
}

/* ── Dışa aktarma ──────────────────────────────────────────────────────── */

/** Tüm çalışma verisini Markdown metnine dönüştürür. */
export function toMarkdown(entries: StudyEntry[]): string {
  const lines: string[] = ["# Çalışma Notlarım", ""];

  for (const e of entries) {
    lines.push(`## ${e.title}`, "");
    if (e.branch) lines.push(`*${e.branch}* · ${e.path}`, "");

    if (e.marks.length) {
      lines.push("### Vurgular", "");
      for (const m of e.marks) lines.push(`- ${m.t.replace(/\s+/g, " ").trim()}`);
      lines.push("");
    }
    if (e.note?.text?.trim()) {
      lines.push("### Not", "", e.note.text.trim(), "");
    }
    if (e.note?.strokes?.length) {
      lines.push(`*(${e.note.strokes.length} çizgilik el yazısı çizim — sayfada saklı)*`, "");
    }
    lines.push("---", "");
  }

  return lines.join("\n");
}

/* ── Yardımcılar ───────────────────────────────────────────────────────── */

/**
 * Yoldaki branşın HAM slug'ı ("genel-dahiliye"), güzelleştirilmemiş hâli.
 *
 * Anahtar olarak kullanılan yer burası: /api/branch-counts sayaçları ve
 * SPECIALTIES kayıtları hep ham slug ile anahtarlanır. Güzelleştirilmiş
 * ad ("Genel Dahiliye") bu anahtarların hiçbiriyle eşleşmez — bu yüzden
 * gösterim adı (branchOf) ile slug ayrı tutulur.
 */
export function branchSlugOf(path: string): string {
  const seg = path.split("/").filter(Boolean);
  // /topics/<bransh>/<konu>  ·  /tr/premium/ydus/<bransh>/<konu>
  const i = seg.indexOf("topics") !== -1 ? seg.indexOf("topics") : seg.indexOf("ydus");
  return i !== -1 ? (seg[i + 1] ?? "") : "";
}

/** Gösterim için branş adı ("Genel Dahiliye"). */
function branchOf(path: string): string {
  const b = branchSlugOf(path);
  return b ? prettifySlug(b) : "";
}

function prettify(path: string): string {
  const last = path.split("/").filter(Boolean).pop() || path;
  return prettifySlug(last);
}

function prettifySlug(s: string): string {
  return s
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toLocaleUpperCase("tr"));
}
