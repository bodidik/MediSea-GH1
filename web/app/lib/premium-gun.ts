/**
 * PREMIUM ÇALIŞMA GÜNLÜĞÜ — gün başına premium çalışma eylemi sayısı.
 *
 * Neden ayrı anahtar: açık sitenin günlüğü (`medisea:log:v1`) "kaç KART
 * çalışıldı" diye okunuyor (/tekrar grafiği). Premium soru/vaka eylemlerini
 * oraya dökmek o sayıları çarpıtırdı. Seri (streak) iki günlüğün BİRLEŞİMİNDEN
 * hesaplanır: herhangi birinde etkinlik olan gün seriyi sürdürür.
 *
 * Yedek + senkron: `study-backup.ts` (altı yer — bkz. CLAUDE.md). Birleştirmede
 * gün başına BÜYÜK olan kazanır, toplanmaz (senkron aynı yedeği her girişte
 * yeniden birleştiriyor).
 */
import { dayKey, readLog, type StudyLog } from "@/app/lib/review-deck";

export const PREMIUM_GUN_KEY = "medisea:pgun:v1";
export type PremiumGun = Record<string, number>;

export function premiumGunNormalize(v: unknown): PremiumGun {
  const out: PremiumGun = {};
  if (!v || typeof v !== "object" || Array.isArray(v)) return out;
  for (const [k, n] of Object.entries(v as Record<string, unknown>)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && typeof n === "number" && Number.isFinite(n) && n > 0) out[k] = Math.floor(n);
  }
  return out;
}

export function premiumGunOku(): PremiumGun {
  try {
    return premiumGunNormalize(JSON.parse(localStorage.getItem(PREMIUM_GUN_KEY) || "null"));
  } catch {
    return {};
  }
}

/** Bir premium çalışma eylemini (soru cevabı, kart işareti, vaka sonu) bugüne işler. */
export function premiumGunIsle() {
  try {
    const g = premiumGunOku();
    const k = dayKey();
    g[k] = (g[k] ?? 0) + 1;
    const sinir = dayKey(new Date(Date.now() - 120 * 86_400_000));
    for (const gun of Object.keys(g)) if (gun < sinir) delete g[gun];
    localStorage.setItem(PREMIUM_GUN_KEY, JSON.stringify(g));
  } catch {
    // kota dolu — günlük süs, çalışmayı engellememeli
  }
}

/** Gün başına büyük olan kazanır (toplama yok). */
export function premiumGunBirlestir(a: PremiumGun, b: PremiumGun): PremiumGun {
  const out: PremiumGun = { ...a };
  for (const [k, n] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, n);
  return out;
}

const aktif = (g: PremiumGun, log: StudyLog, k: string) => (g[k] ?? 0) > 0 || (log[k]?.kart ?? 0) > 0;

/**
 * Kesintisiz çalışma günü (premium + açık site birleşimi). Bugün henüz
 * çalışılmadıysa dünden geriye sayar — gün bitmeden seriyi kırık göstermez.
 */
export function birlesikSeri(now = new Date()): { seri: number; bugun: number; son7: boolean[] } {
  const g = premiumGunOku();
  let log: StudyLog = {};
  try { log = readLog(); } catch {}
  const d = new Date(now);
  const bugunK = dayKey(d);
  const bugun = (g[bugunK] ?? 0) + (log[bugunK]?.kart ?? 0);
  if (!aktif(g, log, bugunK)) d.setDate(d.getDate() - 1);
  let seri = 0;
  while (aktif(g, log, dayKey(d))) {
    seri++;
    d.setDate(d.getDate() - 1);
  }
  const son7: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const x = new Date(now);
    x.setDate(x.getDate() - i);
    son7.push(aktif(g, log, dayKey(x)));
  }
  return { seri, bugun, son7 };
}
