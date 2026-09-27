/**
 * XP KURALI — tek kaynak. Motorlar puanı buradan alır, liderlik ve profil
 * metni kuralı buradan anlatır.
 *
 * Bir dönem canlıda XP kazandıran HİÇBİR yol yoktu: puan veren tek kod
 * (`completeModule`) rotaya alınmayan eski simülasyon sayfalarındaydı; her
 * kullanıcı "Puanın 0 xp" görüyor ve sıralamada kalıcı olarak sonuncuydu.
 *
 * Kalibrasyon: 1072 soru × 10 + 66 set × 50 + 15 vaka × 50 ≈ 14.800 —
 * `rutbe.ts`teki en üst basamak (12.000) çalışmayla ulaşılabilir, hediye
 * edilmez. Her kazanım bir KİMLİĞE bağlı ve bir kez sayılır: aynı soruyu
 * ikinci kez doğru cevaplamak puan vermez.
 */
export const XP = {
  /** Bir sorunun İLK doğru cevabı. */
  dogruCevap: 10,
  /** Bir soru setini sonuna kadar çözmek (yalnızca yanlışlar turu sayılmaz). */
  setBitir: 50,
  /** Bir klinik vakayı sonuna kadar çözmek. */
  vakaBitir: 50,
} as const;

export const xpKimligi = {
  soru: (setId: string, soruId: string) => `soru:${setId}:${soruId}`,
  set: (setId: string) => `set:${setId}`,
  vaka: (branch: string, vakaId: string) => `vaka:${branch}/${vakaId}`,
};

/** Bir kazanımın puanı KİMLİKTEN türer — çağıran miktar veremez, yanlış da veremez. */
export function kazanimDegeri(kimlik: string): number {
  if (kimlik.startsWith("soru:")) return XP.dogruCevap;
  if (kimlik.startsWith("set:")) return XP.setBitir;
  if (kimlik.startsWith("vaka:")) return XP.vakaBitir;
  return 0;
}

/* ── Kayıt: depo · yedek · senkron ORTAK şekli ─────────────────────────── */

export const PUAN_KEY = "ydus_premium_user";

export type PuanKaydi = {
  xp: number;
  /** Tamamlanan KONU kimlikleri (çalışma planı). */
  completedModules: string[];
  badges: string[];
  kazanimlar: string[];
};

const diziSuz = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

/** Depodan ya da yedekten gelen ham değeri güvenli şekle sokar; alan yoksa boş. */
export function puanNormalize(v: unknown): PuanKaydi {
  const o = v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  return {
    xp: typeof o.xp === "number" && Number.isFinite(o.xp) && o.xp > 0 ? o.xp : 0,
    completedModules: diziSuz(o.completedModules),
    badges: diziSuz(o.badges),
    kazanimlar: diziSuz(o.kazanimlar),
  };
}

export function puanBosMu(p: PuanKaydi): boolean {
  return p.xp === 0 && !p.completedModules.length && !p.badges.length && !p.kazanimlar.length;
}

const toplamDeger = (k: string[]) => k.reduce((n, x) => n + kazanimDegeri(x), 0);

/**
 * İKİ KAYDI BİRLEŞTİRİR — sekmeler arası yazım, yedekten içe aktarma ve
 * senkron AYNI kuralı kullanır.
 *
 * Senkron her oturum açılışında aynı yedeği yeniden birleştiriyor, yani kural
 * TEKRARDA SABİT olmalı: XP'yi TOPLAMAK her girişte şişirir, BÜYÜĞÜ ALMAK iki
 * cihazda ayrı kazanılan puanın birini kaybeder. Çözüm XP'yi kazanımlardan
 * türetmek: `xp = taban + Σ değer(kazanımlar)`. Kazanımlar birleşim; taban,
 * kazanım listesine girmeyen eski puan (rotası kapalı simülasyonların
 * `completeModule`/`addXp`'si) — iki taraftan büyüğü, çünkü aynı eski puan
 * iki cihazda da durabilir.
 */
export function puanBirlestir(a: PuanKaydi, b: PuanKaydi): PuanKaydi {
  const kazanimlar = Array.from(new Set([...a.kazanimlar, ...b.kazanimlar]));
  const taban = Math.max(0, a.xp - toplamDeger(a.kazanimlar), b.xp - toplamDeger(b.kazanimlar));
  return {
    xp: taban + toplamDeger(kazanimlar),
    completedModules: Array.from(new Set([...a.completedModules, ...b.completedModules])),
    badges: Array.from(new Set([...a.badges, ...b.badges])),
    kazanimlar,
  };
}

/** Kuralın okunur hâli — liderlik ve profil aynı cümleyi basar. */
export const XP_KURALI_METNI =
  `Her sorunun ilk doğru cevabı ${XP.dogruCevap}, bitirdiğin her soru seti ` +
  `${XP.setBitir}, her klinik vaka ${XP.vakaBitir} seyir mili kazandırır.`;
