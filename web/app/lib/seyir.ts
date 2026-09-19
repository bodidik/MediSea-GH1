// C:\Users\hucig\Medknowledge\web\app\lib\seyir.ts
//
// Deniz sürprizleri ve seyir defteri (19 Eylül 2026, kullanıcı isteği).
//
// Uzun çalışan kullanıcıyı nadiren, sessizce ödüllendiren küçük görünümler:
// ufukta geçen bir yelkenli, seriyi kutlayan bir papağan, gece okuyana yanan
// bir fener. Her görünüm deftere işlenir; defter /calisma-alanim'de.
//
// İLKELER (tasarım kararının gerekçesi, sürücü `DenizSurprizleri.tsx`):
// - Rastgele değil HAK EDİLMİŞ: çoğu tetik emeğe bağlı (kesintisiz okuma
//   süresi, seri, kart eşiği). Yalnızca martı rastgele — o da nadir.
// - Okuma sütununun üstünden geçmez, tıklanamaz, ekran okuyucuya okunmaz.
// - Soru çözerken, vaka ve simülatörde ASLA; orada her hareket gürültü.
// - Hareket azaltma tercihinde hiç çıkmaz; tek anahtarla kapatılır.
//
// DEPO: defter bir ÇALIŞMA KAYDI — yedeğe ve senkrona girer
// (`study-backup.ts`, altı yer). Aç/kapa ise cihaz TERCİHİ; `notew` gibi
// yedekte taşınmaz.

import { guvenliNesneOku } from "@/app/lib/depo";

export const SEYIR_KEY = "medisea:seyir:v1";
const KAPALI_KEY = "medisea:deniz:kapali";

export type Tur = "yelkenli" | "papagan" | "marti" | "fener" | "okaliptus" | "yunus";

export type SeyirKaydi = {
  /** `<tur>:<zaman>` — birleştirmede kimlik */
  id: string;
  tur: Tur;
  t: number;
  /** görüldüğü sayfa */
  yol: string;
  baslik?: string;
  /** neden göründü ("25 dakika kesintisiz okuma") */
  neden?: string;
};

export type Seyir = {
  defter: SeyirKaydi[];
  /** bir kez kutlanan olaylar ("papagan:seri-7:2026-09-19"); tekrar tetiklenmesin */
  kutlanan: string[];
};

export const TURLER: Record<Tur, { ad: string; ikon: string; ipucu: string }> = {
  yelkenli: { ad: "Yelkenli", ikon: "⛵", ipucu: "Uzun ve kesintisiz bir okumanın ufkunda" },
  papagan: { ad: "Papağan", ikon: "🦜", ipucu: "Günler üst üste eklenince konar" },
  marti: { ad: "Martı", ikon: "🕊️", ipucu: "Kimse ne zaman geleceğini bilmez" },
  fener: { ad: "Deniz feneri", ikon: "🗼", ipucu: "Herkes uyurken yanar" },
  okaliptus: { ad: "Okaliptüs", ikon: "🌿", ipucu: "Bir konunun sonunda sallanır" },
  yunus: { ad: "Yunus", ikon: "🐬", ipucu: "Tekrar kartları biriktikçe atlar" },
};

export const TUR_SIRASI: Tur[] = ["yelkenli", "papagan", "fener", "okaliptus", "yunus", "marti"];

const DEFTER_TAVAN = 500;
const KUTLANAN_TAVAN = 400;

function turMu(v: unknown): v is Tur {
  return typeof v === "string" && v in TURLER;
}

/** Şekli ne olursa olsun geçerli bir Seyir döndürür (yedekten de gelebilir). */
export function seyirNormalize(ham: unknown): Seyir {
  const o = (ham && typeof ham === "object" ? ham : {}) as Partial<Seyir>;
  const defter = Array.isArray(o.defter)
    ? o.defter.filter(
        (k): k is SeyirKaydi =>
          !!k && typeof k === "object" && typeof k.id === "string" && turMu(k.tur) && typeof k.t === "number",
      )
    : [];
  const kutlanan = Array.isArray(o.kutlanan) ? o.kutlanan.filter((x): x is string => typeof x === "string") : [];
  return { defter, kutlanan };
}

export function seyirOku(): Seyir {
  try {
    return seyirNormalize(guvenliNesneOku<Seyir>(SEYIR_KEY));
  } catch {
    return { defter: [], kutlanan: [] };
  }
}

function seyirYaz(s: Seyir) {
  const defter = [...s.defter].sort((a, b) => a.t - b.t).slice(-DEFTER_TAVAN);
  const kutlanan = s.kutlanan.slice(-KUTLANAN_TAVAN);
  try {
    localStorage.setItem(SEYIR_KEY, JSON.stringify({ defter, kutlanan }));
    // Senkron bu olayı dinliyor; defter de çalışma kaydı.
    window.dispatchEvent(new Event("medisea:changed"));
  } catch {
    // kota dolu — sürpriz süs, çalışmayı engellememeli
  }
}

export function kutlandiMi(anahtar: string): boolean {
  return seyirOku().kutlanan.includes(anahtar);
}

/** Görünümü deftere işler; `anahtar` verilirse aynı olay bir daha tetiklenmez. */
export function defteriIsle(kayit: Omit<SeyirKaydi, "id" | "t">, anahtar?: string) {
  const s = seyirOku();
  const t = Date.now();
  s.defter.push({ ...kayit, id: `${kayit.tur}:${t}`, t });
  if (anahtar && !s.kutlanan.includes(anahtar)) s.kutlanan.push(anahtar);
  seyirYaz(s);
}

/** Görünüm OLMADAN "kutlandı" işareti — defterde kayıt oluşmaz. */
export function kutlandiIsaretle(anahtar: string) {
  const s = seyirOku();
  if (s.kutlanan.includes(anahtar)) return;
  s.kutlanan.push(anahtar);
  seyirYaz(s);
}

export function sonGorulme(tur: Tur): number {
  let son = 0;
  for (const k of seyirOku().defter) if (k.tur === tur && k.t > son) son = k.t;
  return son;
}

/** Bugün kaç kez görüldü (yerel gün). */
export function bugunSayisi(tur: Tur, gun: string, gunAnahtari: (d: Date) => string): number {
  return seyirOku().defter.filter((k) => k.tur === tur && gunAnahtari(new Date(k.t)) === gun).length;
}

/* ── Tercih ─────────────────────────────────────────────────────────────── */

export function surprizAcikMi(): boolean {
  try {
    return localStorage.getItem(KAPALI_KEY) !== "1";
  } catch {
    return false;
  }
}

export function surprizAyarla(acik: boolean) {
  try {
    if (acik) localStorage.removeItem(KAPALI_KEY);
    else localStorage.setItem(KAPALI_KEY, "1");
    window.dispatchEvent(new Event("medisea:deniz-ayar"));
  } catch {
    /* depo engelli — tercih bu oturumda kalır */
  }
}

/* ── Birleştirme (yedek / senkron) ──────────────────────────────────────── */

/**
 * BİRLEŞİM. Defter tek yönlü bir kayıt: iki cihazda görülen iki yelkenli
 * ikisi de gerçekten görüldü. "Yeni kazanır" deseydik telefondaki defter
 * tabletten gelen yedekle silinirdi (kart işaretleriyle aynı gerekçe).
 */
export function seyirBirlestir(a: Seyir, b: Seyir): Seyir {
  const idler = new Set(a.defter.map((k) => k.id));
  return {
    defter: [...a.defter, ...b.defter.filter((k) => !idler.has(k.id))].sort((x, y) => x.t - y.t),
    kutlanan: [...new Set([...a.kutlanan, ...b.kutlanan])],
  };
}
