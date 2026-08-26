// C:\Users\hucig\Medknowledge\web\app\lib\study-backup.ts
//
// Çalışma verisinin tam yedeği: vurgular, notlar, el çizimleri, tekrar durumu.
//
// Markdown dışa aktarımı okumak içindir ve kayıplıdır (çizimleri, ofsetleri ve
// tekrar takvimini taşımaz). Bu dosya kayıpsız olanı yapar — başka cihaza
// taşımak ya da tarayıcı temizlenmeden önce yedeklemek için.
//
// İçe aktarma VARSAYILAN OLARAK BİRLEŞTİRİR, ezmez. Önce kuru bir prova
// çalıştırılır; kullanıcı ne olacağını görmeden hiçbir şey yazılmaz.

import type { ReadingMark } from "@/app/lib/reading-marks";
import type { CardState, StudyLog } from "@/app/lib/review-deck";
import type { NoteDoc } from "@/app/lib/study-index";

import { BOZUK_EK, guvenliDiziOku, guvenliNesneOku } from "@/app/lib/depo";

const MARK_PREFIX = "medisea:marks:v2:";
const NOTE_PREFIX = "medisea:notes:v1:";
const REVIEW_KEY = "medisea:review:v1";
const INDEX_KEY = "medisea:index:v1";
const LOG_KEY = "medisea:log:v1";
/** FlashcardPlayer'ın yazdığı anahtar: `medisea:kartlar:v1:<setId>` → kart id dizisi */
const KART_PREFIX = "medisea:kartlar:v1:";

export type IndexRow = { title: string; at: number };

export type Backup = {
  app: "medisea";
  v: 1;
  at: number;
  marks: Record<string, ReadingMark[]>;
  notes: Record<string, NoteDoc>;
  review: Record<string, CardState>;
  index: Record<string, IndexRow>;
  /** Çalışma günlüğü. Seri (streak) bundan hesaplanır; taşınmazsa sıfırlanır. */
  log: StudyLog;
  /**
   * Flashcard setlerinde "biliyorum" işaretleri: set kimliği → kart kimlikleri.
   *
   * Yedekte YOKTU. 79 kartlık bir seti eleye eleye bitiren kullanıcı, cihaz
   * değiştirdiğinde ya da yedekten döndüğünde hepsini baştan işaretlemek
   * zorunda kalıyordu — üstelik dışa aktarım "tamamı taşındı" izlenimi
   * veriyordu. Eksik alan sessiz veri kaybıdır; `log` da bir dönem aynı
   * şekilde düşüyordu (bkz. CLAUDE.md).
   *
   * Eski yedeklerde bu alan bulunmaz; `parseBackup` onu boş nesneye çevirir.
   */
  kartlar: Record<string, string[]>;
};

export type BackupSummary = {
  sayfa: number;
  vurgu: number;
  not: number;
  cizgi: number;
  tekrarDurumu: number;
  /** Flashcard setlerinde "biliyorum" işaretli kart sayısı */
  kartIsareti: number;
  tarih: number;
};

/** İçe aktarmadan ÖNCE ne olacağını anlatan kuru prova sonucu. */
export type ImportPlan = {
  ok: boolean;
  hata?: string;
  ozet?: BackupSummary;
  yeniSayfa: number;
  yeniVurgu: number;
  yeniNot: number;
  /** birleştirmede üzerine yazılacak notlar (yedektekiler daha yeni) */
  ezilecekNot: number;
  /** yedekteki daha eski olduğu için ATLANACAK notlar */
  atlanacakNot: number;
};

/* ── Okuma ─────────────────────────────────────────────────────────────── */

/**
 * Depodaki çalışma verisinin tamamı, tek nesne.
 *
 * Sayaç üreten ya da veri taşıyan HER yer buradan okur. Bir dönem senkron ve
 * profil sayfası bu yürüyüşün kendi kopyalarını tutuyordu; kopyalar sessizce
 * ayrıştı (`log` yalnızca birine eklendi, sayfa sayımı diğerinde çift saydı).
 */
export function readAll(): Backup {
  const marks: Record<string, ReadingMark[]> = {};
  const notes: Record<string, NoteDoc> = {};
  const kartlar: Record<string, string[]> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    /**
     * Yedek anahtarı (`…:bozuk`) bir YOL değil, dışa aktarıma girmemeli.
     * İçeriği ayrıştırılamadığı sürece zaten eleniyordu — ama artık
     * "geçerli JSON ama yanlış ŞEKİL" kayıtları da yedekleniyor ve
     * `{"yanlis":"sekil"}` gibi bir yedek NOT olarak sızabilirdi.
     */
    if (k.endsWith(BOZUK_EK)) continue;
    if (k.startsWith(MARK_PREFIX)) {
      const v = guvenliDiziOku<ReadingMark>(k);
      if (Array.isArray(v) && v.length) marks[k.slice(MARK_PREFIX.length)] = v;
    } else if (k.startsWith(KART_PREFIX)) {
      const v = guvenliDiziOku<string>(k);
      // Boş dizi taşınmaz: hiç işaretlenmemiş set, veri değil gürültüdür.
      if (Array.isArray(v) && v.length) {
        kartlar[k.slice(KART_PREFIX.length)] = v.filter((x) => typeof x === "string");
      }
    } else if (k.startsWith(NOTE_PREFIX)) {
      /**
       * Not güvenli şekle sokulur: `strokes` DİZİ, `text` DİZE olmak zorunda.
       * Depo bunu garanti etmiyor — yedekten geri yükleme elle düzenlenmiş
       * bir JSON kabul edebiliyor ve `parseBackup` yalnızca sığ doğruluyor.
       * Ölçüldü: `strokes` yerine bir dize düştüğünde `.length` karakter
       * sayısını veriyor ve "10 çizgi" gibi UYDURMA bir sayı üretiyordu.
       */
      const ham = guvenliNesneOku<NoteDoc>(k);
      const v = ham && typeof ham === "object"
        ? {
            ...ham,
            text: typeof ham.text === "string" ? ham.text : "",
            strokes: Array.isArray(ham.strokes) ? ham.strokes : [],
          }
        : null;
      if (v && (v.text.trim() || v.strokes.length)) notes[k.slice(NOTE_PREFIX.length)] = v;
    }
  }

  return {
    app: "medisea",
    v: 1,
    at: Date.now(),
    marks,
    notes,
    review: guvenliNesneOku<Record<string, CardState>>(REVIEW_KEY) ?? {},
    index: guvenliNesneOku<Record<string, IndexRow>>(INDEX_KEY) ?? {},
    log: guvenliNesneOku<StudyLog>(LOG_KEY) ?? {},
    kartlar,
  };
}

export function summarize(b: Backup): BackupSummary {
  const sayfalar = new Set([...Object.keys(b.marks), ...Object.keys(b.notes)]);
  return {
    sayfa: sayfalar.size,
    vurgu: Object.values(b.marks).reduce((n, a) => n + a.length, 0),
    not: Object.values(b.notes).filter((n) => n.text?.trim()).length,
    cizgi: Object.values(b.notes).reduce((n, d) => n + (d.strokes?.length ?? 0), 0),
    tekrarDurumu: Object.keys(b.review).length,
    kartIsareti: Object.values(b.kartlar).reduce((n, a) => n + a.length, 0),
    tarih: b.at,
  };
}

/* ── Dışa aktarma ──────────────────────────────────────────────────────── */

export function exportBackup(): { blob: Blob; name: string; ozet: BackupSummary } {
  const b = readAll();
  const d = new Date(b.at);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    blob: new Blob([JSON.stringify(b)], { type: "application/json" }),
    name: `medisea-calisma-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.json`,
    ozet: summarize(b),
  };
}

/* ── Doğrulama ─────────────────────────────────────────────────────────── */

/**
 * Ayrık birleşim (`{ok:true}|{ok:false}`) yerine "b null ise hata var" şekli:
 * bu proje `strict: false` ile derleniyor ve strictNullChecks kapalıyken
 * TypeScript boole-değişmezli ayrımı daraltmıyor — `p.hata` erişimi hata verirdi.
 */
function parseBackup(text: string): { b: Backup | null; hata?: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { b: null, hata: "Dosya okunamadı — geçerli bir JSON değil." };
  }
  const b = raw as Partial<Backup>;
  if (!b || typeof b !== "object") return { b: null, hata: "Dosya boş ya da bozuk." };
  if (b.app !== "medisea") return { b: null, hata: "Bu dosya MediSea yedeği değil." };
  if (b.v !== 1) return { b: null, hata: `Desteklenmeyen yedek sürümü (${String(b.v)}).` };

  // eksik alanları tolere et — kısmi yedek de işe yarar
  return {
    b: {
      app: "medisea",
      v: 1,
      at: typeof b.at === "number" ? b.at : 0,
      marks: (b.marks && typeof b.marks === "object" ? b.marks : {}) as Backup["marks"],
      notes: (b.notes && typeof b.notes === "object" ? b.notes : {}) as Backup["notes"],
      review: (b.review && typeof b.review === "object" ? b.review : {}) as Backup["review"],
      index: (b.index && typeof b.index === "object" ? b.index : {}) as Backup["index"],
      log: (b.log && typeof b.log === "object" ? b.log : {}) as Backup["log"],
      // Bu alan eklenmeden önce alınmış yedeklerde YOK — boş nesneye düşmeli,
      // yoksa eski bir yedeği geri yüklemek içe aktarmayı tümden düşürürdü.
      kartlar: (b.kartlar && typeof b.kartlar === "object" ? b.kartlar : {}) as Backup["kartlar"],
    },
  };
}

/** Hiçbir şey yazmadan, içe aktarmanın sonucunu hesaplar. */
export function planImport(text: string): ImportPlan {
  const p = parseBackup(text);
  if (!p.b) {
    return { ok: false, hata: p.hata, yeniSayfa: 0, yeniVurgu: 0, yeniNot: 0, ezilecekNot: 0, atlanacakNot: 0 };
  }
  const gelen = p.b;
  const mevcut = readAll();

  const mevcutSayfa = new Set([...Object.keys(mevcut.marks), ...Object.keys(mevcut.notes)]);
  const gelenSayfa = new Set([...Object.keys(gelen.marks), ...Object.keys(gelen.notes)]);

  let yeniVurgu = 0;
  for (const [yol, liste] of Object.entries(gelen.marks)) {
    const varOlan = new Set((mevcut.marks[yol] ?? []).map((m) => m.id));
    yeniVurgu += liste.filter((m) => !varOlan.has(m.id)).length;
  }

  let yeniNot = 0;
  let ezilecekNot = 0;
  let atlanacakNot = 0;
  for (const yol of Object.keys(gelen.notes)) {
    if (!mevcut.notes[yol]) {
      yeniNot++;
    } else if (newerWins(gelen.index[yol]?.at, mevcut.index[yol]?.at)) {
      ezilecekNot++;
    } else {
      atlanacakNot++;
    }
  }

  return {
    ok: true,
    ozet: summarize(gelen),
    yeniSayfa: [...gelenSayfa].filter((y) => !mevcutSayfa.has(y)).length,
    yeniVurgu,
    yeniNot,
    ezilecekNot,
    atlanacakNot,
  };
}

/** Yedektekinin daha yeni olup olmadığı. Zaman bilinmiyorsa mevcut korunur. */
function newerWins(gelenAt?: number, mevcutAt?: number): boolean {
  if (typeof gelenAt !== "number") return false;
  if (typeof mevcutAt !== "number") return true;
  return gelenAt > mevcutAt;
}

/* ── İçe aktarma ───────────────────────────────────────────────────────── */

export type ImportMode = "merge" | "replace";

export function applyImport(text: string, mode: ImportMode): { ok: boolean; hata?: string } {
  const p = parseBackup(text);
  if (!p.b) return { ok: false, hata: p.hata };
  const gelen = p.b;

  try {
    if (mode === "replace") {
      // Yalnızca write()'ın GERİ KOYACAĞI anahtarları sil. Kullanıcı tercihleri
      // (notew, notepaper), tanıtım kartları (hint:*) ve senkron durumu (sync:*)
      // yedekte YOKTUR; silinirse geri gelmezler — bu sessiz veri kaybıdır.
      const VERİ_ONEKI = [MARK_PREFIX, NOTE_PREFIX, REVIEW_KEY, INDEX_KEY, LOG_KEY, KART_PREFIX];
      const silinecek: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && VERİ_ONEKI.some((o) => k.startsWith(o))) silinecek.push(k);
      }
      silinecek.forEach((k) => localStorage.removeItem(k));

      write(gelen);
      return { ok: true };
    }

    // BİRLEŞTİR
    const mevcut = readAll();

    // vurgular: id'ye göre birleşim, çakışmada mevcut korunur
    const marks: Record<string, ReadingMark[]> = { ...mevcut.marks };
    for (const [yol, liste] of Object.entries(gelen.marks)) {
      const varOlan = marks[yol] ?? [];
      const idler = new Set(varOlan.map((m) => m.id));
      marks[yol] = [...varOlan, ...liste.filter((m) => !idler.has(m.id))];
    }

    // notlar: daha yeni olan kazanır
    const notes: Record<string, NoteDoc> = { ...mevcut.notes };
    for (const [yol, doc] of Object.entries(gelen.notes)) {
      if (!notes[yol] || newerWins(gelen.index[yol]?.at, mevcut.index[yol]?.at)) notes[yol] = doc;
    }

    // tekrar durumu: en son görülen kazanır
    const review: Record<string, CardState> = { ...mevcut.review };
    for (const [id, st] of Object.entries(gelen.review)) {
      const v = review[id];
      if (!v || (st?.seen ?? 0) > (v.seen ?? 0)) review[id] = st;
    }

    // dizin: daha yeni kayıt kazanır
    const index: Record<string, IndexRow> = { ...mevcut.index };
    for (const [yol, row] of Object.entries(gelen.index)) {
      if (!index[yol] || (row?.at ?? 0) > (index[yol]?.at ?? 0)) index[yol] = row;
    }

    // günlük: gün başına BÜYÜK olan kazanır, toplanmaz. Senkron her oturum
    // açılışında aynı yedeği birleştiriyor; toplasaydık her girişte şişerdi.
    const log: StudyLog = { ...mevcut.log };
    for (const [gun, g] of Object.entries(gelen.log)) {
      const v = log[gun];
      log[gun] = {
        kart: Math.max(v?.kart ?? 0, g?.kart ?? 0),
        dogru: Math.max(v?.dogru ?? 0, g?.dogru ?? 0),
      };
    }

    // kartlar: BİRLEŞİM. "Biliyorum" tek yönlü bir bilgi — iki cihazda farklı
    // kartlar işaretlenmişse ikisi de doğrudur, biri ötekini eleyemez. Notlarda
    // olduğu gibi "yeni olan kazanır" deseydik, telefonda işaretlenen kartlar
    // tabletten gelen yedekle silinirdi.
    const kartlar: Record<string, string[]> = { ...mevcut.kartlar };
    for (const [set, liste] of Object.entries(gelen.kartlar)) {
      kartlar[set] = [...new Set([...(kartlar[set] ?? []), ...liste])];
    }

    write({ app: "medisea", v: 1, at: Date.now(), marks, notes, review, index, log, kartlar });
    return { ok: true };
  } catch (e) {
    return { ok: false, hata: "Yazma başarısız — tarayıcı depolama alanı dolu olabilir." };
  }
}

function write(b: Backup) {
  for (const [yol, liste] of Object.entries(b.marks)) {
    if (liste.length) localStorage.setItem(MARK_PREFIX + yol, JSON.stringify(liste));
  }
  for (const [yol, doc] of Object.entries(b.notes)) {
    localStorage.setItem(NOTE_PREFIX + yol, JSON.stringify(doc));
  }
  if (Object.keys(b.review).length) localStorage.setItem(REVIEW_KEY, JSON.stringify(b.review));
  if (Object.keys(b.index).length) localStorage.setItem(INDEX_KEY, JSON.stringify(b.index));
  if (Object.keys(b.log).length) localStorage.setItem(LOG_KEY, JSON.stringify(b.log));
  for (const [set, liste] of Object.entries(b.kartlar)) {
    if (liste.length) localStorage.setItem(KART_PREFIX + set, JSON.stringify(liste));
  }
}

/* ── Depolama ölçümü ───────────────────────────────────────────────────── */

/**
 * localStorage tipik olarak ~5 MB ile sınırlıdır ve el çizimleri hızla büyür.
 * Dolduğunda yazmalar sessizce başarısız olur — bu yüzden ölçüp gösteriyoruz.
 */
export function storageUsage(): { bytes: number; limit: number; oran: number } {
  let bytes = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith("medisea:")) continue;
      bytes += (k.length + (localStorage.getItem(k)?.length ?? 0)) * 2; // UTF-16
    }
  } catch {}
  const limit = 5 * 1024 * 1024;
  return { bytes, limit, oran: bytes / limit };
}

export function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
