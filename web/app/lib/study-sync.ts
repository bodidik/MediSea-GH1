// Çalışma verisini sunucuyla senkronlar.
//
// localStorage birincildir, sunucu yedektir. Senkron başarısız olursa
// kullanıcı yerel çalışmasına devam eder — hiçbir şey bozulmaz.
//
// İki yön:
//  push(): yereldeki veriyi sunucuya yaz (debounced, her değişiklikte)
//  pull(): sunucudan çek, boş cihaza yükle (oturum açıldığında bir kez)

import {
  readAll,
  summarize,
  applyImport,
  type Backup,
  type BackupSummary,
} from "@/app/lib/study-backup";
import { countsOf } from "@/app/lib/study-stats";

const SYNC_META_KEY = "medisea:sync:v1";

type SyncMeta = {
  lastPush: number;
  lastPull: number;
  pushBytes: number;
};

function readMeta(): SyncMeta {
  try {
    const raw = localStorage.getItem(SYNC_META_KEY);
    return raw ? JSON.parse(raw) : { lastPush: 0, lastPull: 0, pushBytes: 0 };
  } catch {
    return { lastPush: 0, lastPull: 0, pushBytes: 0 };
  }
}

function writeMeta(m: SyncMeta) {
  try {
    localStorage.setItem(SYNC_META_KEY, JSON.stringify(m));
  } catch {}
}

/* ── Push ──────────────────────────────────────────────────────────────── */

let pushTimer: ReturnType<typeof setTimeout> | null = null;
const PUSH_DELAY = 5_000;

function buildPayload(): { body: object; bytes: number } | null {
  try {
    const payload = readAll();
    const c = countsOf(payload);

    return {
      body: {
        marks: c.marks,
        notes: c.notes,
        strokes: c.strokes,
        cards: c.cards,
        due: c.due,
        streak: c.streak,
        pages: c.pages,
        payload,
      },
      bytes: new Blob([JSON.stringify(payload)]).size,
    };
  } catch {
    return null;
  }
}

let authOk = false;

// Sunucuyla en az bir kez uzlaşılmadan push YAPILMAZ. Deposu boş bir cihaz
// (yeni tarayıcı, temizlenmiş depo) aksi halde ilk `beforeunload` anında
// sunucudaki yedeğin üzerine boş bir yük yazıp her şeyi siliyordu.
let reconciled = false;
let bekleyenPush = false;

export function setAuthReady(v: boolean) {
  authOk = v;
  if (!v) reconciled = false;
}

function markReconciled() {
  reconciled = true;
  if (bekleyenPush) {
    bekleyenPush = false;
    schedulePush();
  }
}

async function doPush(): Promise<boolean> {
  if (!authOk) return false;
  if (!reconciled) {
    bekleyenPush = true;
    return false;
  }

  const data = buildPayload();
  if (!data) return false;

  try {
    const r = await fetch("/api/study", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.body),
    });

    if (r.status === 401) { authOk = false; return false; }
    if (!r.ok) return false;

    const meta = readMeta();
    meta.lastPush = Date.now();
    meta.pushBytes = data.bytes;
    writeMeta(meta);
    return true;
  } catch {
    return false;
  }
}

export function schedulePush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    doPush();
  }, PUSH_DELAY);
}

export async function pushNow(): Promise<boolean> {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  return doPush();
}

/* ── Pull ──────────────────────────────────────────────────────────────── */

export type PullResult =
  | { ok: true; loaded: boolean; summary: BackupSummary | null }
  | { ok: false; reason: string };

export async function pull(): Promise<PullResult> {
  if (!authOk) return { ok: false, reason: "auth" };
  try {
    const r = await fetch("/api/study");
    if (r.status === 401) return { ok: false, reason: "auth" };
    if (!r.ok) return { ok: false, reason: "server" };

    const j = await r.json();
    if (!j.ok) return { ok: false, reason: j.reason ?? "unknown" };

    // Sunucuda kayıt yok — kaybedilecek bir şey yok, push serbest.
    if (!j.payload) {
      markReconciled();
      return { ok: true, loaded: false, summary: null };
    }

    const payload = j.payload as Backup;
    if (payload.app !== "medisea" || payload.v !== 1) {
      // Tanımadığımız şema: üzerine yazmaktansa senkronu kapalı tut.
      return { ok: true, loaded: false, summary: null };
    }

    // Boş cihaz da dolu cihaz da BİRLEŞTİRİR — birleştirme hiçbir şeyi silmez,
    // dolayısıyla ayrı bir "boş cihaz" yoluna gerek yok.
    const result = applyImport(JSON.stringify(payload), "merge");
    if (!result.ok) return { ok: false, reason: result.hata ?? "import" };

    const meta = readMeta();
    meta.lastPull = Date.now();
    writeMeta(meta);
    markReconciled();

    return {
      ok: true,
      loaded: true,
      summary: summarize(payload),
    };
  } catch {
    return { ok: false, reason: "network" };
  }
}

/* ── Olay dinleyicisi ──────────────────────────────────────────────────── */

let listening = false;

export function startListening() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("medisea:changed", () => schedulePush());
}

/* ── Senkron durumu ────────────────────────────────────────────────────── */

export function syncStatus(): SyncMeta {
  return readMeta();
}
