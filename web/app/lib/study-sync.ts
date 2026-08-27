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

/* ── Durum yayını ───────────────────────────────────────────────────────
 *
 * Senkron şimdiye kadar tamamen sessiz çalışıyordu: veri gidiyordu ama
 * kullanıcı bunu hiç görmüyordu. Görünmeyen bir güvence, güvence değildir —
 * özellikle notlarını kaybetmekten çekinen biri için. Aşağısı yalnızca
 * DURUM BİLDİRİR, senkron mantığına karışmaz.
 */
export type SyncDurum =
  | "kapali"        // oturum yok — veri yalnızca bu cihazda
  | "bekliyor"      // değişiklik var, gönderim sırada
  | "gonderiliyor"
  | "tamam"
  | "hata"
  // Sunucudaki yedek tanımadığımız bir şemada. "hata"dan AYRI, çünkü o
  // "bağlantı gelince tekrar denenecek" diyor; bu durum kendiliğinden
  // düzelmiyor ve kullanıcının bilmesi gereken şey farklı.
  | "surum";

let durum: SyncDurum = "kapali";
const dinleyiciler = new Set<(d: SyncDurum) => void>();

function durumaGec(d: SyncDurum) {
  if (durum === d) return;
  durum = d;
  for (const f of dinleyiciler) {
    try { f(d); } catch {}
  }
}

export function syncDurumu(): SyncDurum {
  return durum;
}

/** Döndürdüğü işlev aboneliği bırakır. */
export function syncDinle(f: (d: SyncDurum) => void): () => void {
  dinleyiciler.add(f);
  return () => { dinleyiciler.delete(f); };
}

let authOk = false;

// Sunucuyla en az bir kez uzlaşılmadan push YAPILMAZ. Deposu boş bir cihaz
// (yeni tarayıcı, temizlenmiş depo) aksi halde ilk `beforeunload` anında
// sunucudaki yedeğin üzerine boş bir yük yazıp her şeyi siliyordu.
let reconciled = false;
let bekleyenPush = false;

export function setAuthReady(v: boolean) {
  authOk = v;
  if (!v) {
    reconciled = false;
    durumaGec("kapali");
  }
}

function markReconciled() {
  reconciled = true;
  if (bekleyenPush) {
    bekleyenPush = false;
    schedulePush();
  }
}

/**
 * 401 — İKİ ÇIKIŞIN AYRIŞMAMASI İÇİN TEK YER.
 *
 * Ölçüldü (gerçek modül, dört senaryo): `doPush` 401'de `authOk`ı
 * düşürüyordu, `pull` düşürmüyordu. Aynı HTTP durumu, iki farklı sonuç:
 *
 *   doPush 401 -> gösterge "Yalnızca bu cihazda"   (dürüst)
 *   pull   401 -> gösterge "Kaydediliyor…" KALICI  (yalan, 0 PUT gidiyor)
 *
 * İkincisinde `authOk` true kaldığı için `schedulePush` göstergeyi
 * "bekliyor" yapıyor, `doPush` ise uzlaşma olmadığı için sessizce dönüyordu.
 * Bu dosyanın kendi kuralı: "gösterge sonsuza kadar 'Kaydediliyor…' der ve
 * kullanıcı kaydedildiğini sanır."
 */
function oturumDustu() {
  authOk = false;
  reconciled = false;
  bekleyenPush = false;
  durumaGec("kapali");
}

/** Aynı anda ikinci bir uzlaşma isteği çıkmasın. */
let pullUcuyor = false;

async function doPush(): Promise<boolean> {
  // Sessizce dönmek göstergeyi `schedulePush`ın bıraktığı "Kaydediliyor…"
  // durumunda dondurur; oturum yoksa bunu SÖYLE.
  if (!authOk) { durumaGec("kapali"); return false; }
  if (!reconciled) {
    bekleyenPush = true;
    /*
     * UZLAŞMA BİR KEZ DENENİR VE BİR DAHA DENENMEZDİ.
     *
     * `useStudySync` `pull()`ı `pulled` ref'iyle koruyor ve o ref sayfa ömrü
     * boyunca hiç sıfırlanmıyor. Uzlaşma ilk denemede başarısız olursa (401,
     * ağ hatası, 5xx) push KALICI olarak ölü kalıyordu — üstelik göstergenin
     * yanındaki metin "bir sonraki değişiklikte yeniden denenecek" diyor,
     * yani vaat karşılanmıyordu.
     *
     * Burada yeniden denemek üç yolu birden kapatıyor ve o vaadi doğru
     * yapıyor. Döngü riski yok: pull ya uzlaşıyor (reconciled=true) ya da
     * 401'de `authOk`ı düşürüyor; ikisi de bu dalı bir daha çalıştırmıyor.
     */
    if (!pullUcuyor) {
      pullUcuyor = true;
      pull().finally(() => { pullUcuyor = false; });
    }
    return false;
  }

  const data = buildPayload();
  if (!data) {
    // Depoda bozuk bir kayıt var (readAll fırlattı). Sessizce dönmek en kötü
    // seçenek: schedulePush göstergeyi ZATEN "Kaydediliyor…" yapmış oluyor ve
    // burada susarsak orada sonsuza kadar öyle kalıyor — kullanıcı
    // kaydedildiğini sanıyor. Ölçüldü, dosyanın kendi kuralının ihlaliydi.
    durumaGec("hata");
    return false;
  }

  durumaGec("gonderiliyor");

  try {
    const r = await fetch("/api/study", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.body),
    });

    if (r.status === 401) { oturumDustu(); return false; }
    if (!r.ok) { durumaGec("hata"); return false; }

    const meta = readMeta();
    meta.lastPush = Date.now();
    meta.pushBytes = data.bytes;
    writeMeta(meta);
    durumaGec("tamam");
    return true;
  } catch {
    durumaGec("hata");
    return false;
  }
}

export function schedulePush() {
  if (pushTimer) clearTimeout(pushTimer);
  if (authOk) durumaGec("bekliyor");
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
    if (r.status === 401) { oturumDustu(); return { ok: false, reason: "auth" }; }
    // Uzlaşma başarısızsa push hiç yapılmayacak. Bunu söylemezsek gösterge
    // sonsuza kadar "Kaydediliyor…" der ve kullanıcı kaydedildiğini sanır.
    if (!r.ok) { durumaGec("hata"); return { ok: false, reason: "server" }; }

    const j = await r.json();
    if (!j.ok) { durumaGec("hata"); return { ok: false, reason: j.reason ?? "unknown" }; }

    // Sunucuda kayıt yok — kaybedilecek bir şey yok, push serbest.
    if (!j.payload) {
      markReconciled();
      return { ok: true, loaded: false, summary: null };
    }

    const payload = j.payload as Backup;
    if (payload.app !== "medisea" || payload.v !== 1) {
      // Tanımadığımız şema: üzerine yazmaktansa senkronu kapalı tut.
      //
      // AMA bunu SÖYLEMEK zorunda: uzlaşma olmadan `doPush` hiçbir şey
      // göndermiyor, dolayısıyla sessiz kalmak cihazı kalıcı olarak
      // kaydetmez hâle getirip kullanıcıya bunu hiç duyurmamak demekti.
      // Fonksiyonun başındaki kuralın ta kendisi.
      durumaGec("surum");
      return { ok: false, reason: "surum" };
    }

    // Boş cihaz da dolu cihaz da BİRLEŞTİRİR — birleştirme hiçbir şeyi silmez,
    // dolayısıyla ayrı bir "boş cihaz" yoluna gerek yok.
    const result = applyImport(JSON.stringify(payload), "merge");
    if (!result.ok) { durumaGec("hata"); return { ok: false, reason: result.hata ?? "import" }; }

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
    durumaGec("hata");
    return { ok: false, reason: "network" };
  }
}

/* ── Olay dinleyicisi ──────────────────────────────────────────────────── */

let listening = false;

export function startListening() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("medisea:changed", () => schedulePush());

  // Sayfa arka plana düşerken bekleyen push'u hemen gönder. İki sinyal:
  //  · visibilitychange — tablet'te uygulama değiştirme, kilit ekranı
  //  · pagehide — bfcache'e giriş, sekme kapatma (beforeunload'dan güvenilir)
  // İkisi de son şans: bunlardan sonra JS çalışmayabilir.
  const urgentFlush = () => {
    if (document.visibilityState === "hidden") pushNow();
  };
  document.addEventListener("visibilitychange", urgentFlush);
  window.addEventListener("pagehide", () => pushNow());
}

/* ── Senkron durumu ────────────────────────────────────────────────────── */

export function syncStatus(): SyncMeta {
  return readMeta();
}
