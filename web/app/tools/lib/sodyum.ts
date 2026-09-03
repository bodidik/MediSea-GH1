/**
 * SODYUM GÜVENLİK HESAPLARI — saf modül, tarayıcı gerektirmez.
 *
 * Neden ayrı dosya: `sodium/page.tsx` içindeki hesap mantığı yalnızca
 * tarayıcıda sınanabiliyor. Buradaki iki hesap `node
 * --experimental-strip-types` ile doğrudan sürülebiliyor, yani onlarca vaka
 * saniyeler içinde ölçülüyor. (Belgede kayıtlı: asit-baz motorunda mantık
 * sayfanın içindeyken ÜÇ kusur uzun süre görülmedi.)
 *
 * Buradaki hiçbir fonksiyon Adrogué-Madias hesabına DOKUNMUYOR. İkisi de
 * İKİNCİ OKUMA: biri aracın kendi ilan ettiği günlük tavanı uygulanabilir
 * kılıyor, öteki formülün bilinen kör noktasını (idrar kayıpları) ölçüyor.
 */

/**
 * Günlük düzeltme tavanları — mEq/L/gün.
 *
 * Bu sayılar YENİ bir klinik iddia DEĞİL: aracın kendi düğme etiketleri
 * ("Kronik ≤8 mEq/L/gün", "Akut ≤12 mEq/gün") ve uyarı kutuları
 * ("Hipernatremide ≤10 mEq/L/gün") zaten bunları söylüyordu. Eksik olan
 * ARİTMETİKTİ — ekran hedefi ve toplam süreyi basıyor, ilk 24 saatte nerede
 * durulacağını söylemiyordu.
 */
export const GUNLUK_TAVAN = {
  kronik: 8,
  akut: 12,
  hiper: 10,
} as const;

/** İdrar alanlarının makullük sınırları. */
export const IDRAR_SINIR = {
  /* İdrar Na 0 MEŞRU: prerenal azotemide ölçüm sınırının altına iner.
     Bu yüzden alt sınır 0 ve kapı ham dizeye bakmalı (bkz. sayiGirildiMi). */
  na: [0, 300] as const,
  k: [0, 150] as const,
  hacim: [100, 10000] as const,
};

export type Ilk24 = {
  /** Uygulanan günlük tavan (mEq/L/gün). */
  tavan: number;
  /** İlk 24 saatin sonunda olunması gereken serum Na. */
  hedef: number;
  /** İstenen hedefe tek günde ulaşılıyor mu? */
  tekGunde: boolean;
  /** Toplam gerekli gün (tavan hızıyla). */
  gun: number;
  /** İstenen toplam değişim (işaretli). */
  delta: number;
};

/**
 * İLK 24 SAAT GÜVENLİ HEDEFİ.
 *
 * Yön işaretten çıkıyor: `hedef > mevcut` ise yükseltiliyor (hiponatremi),
 * tersi ise düşürülüyor (hipernatremi). Tek fonksiyon iki kipi de karşılıyor;
 * iki ayrı kopya yazmak bu depoda tur tur avlanan "iki gerçeklik" sınıfını
 * açardı.
 *
 * `tekGunde` false ise ekran hedefi tek günde vaat ETMEMELİ: ilk 24 saatin
 * sonu `hedef` alanında duruyor ve asıl hedefe `gun` günde varılıyor.
 */
export function ilk24Hedef(
  mevcut: number,
  istenenHedef: number,
  tavan: number
): Ilk24 | null {
  if (!Number.isFinite(mevcut) || !Number.isFinite(istenenHedef)) return null;
  if (!Number.isFinite(tavan) || tavan <= 0) return null;

  const delta = istenenHedef - mevcut;
  if (delta === 0) return null;

  const yon = delta > 0 ? 1 : -1;
  const mutlak = Math.abs(delta);
  const tekGunde = mutlak <= tavan;

  /* Hedef tavanın altındaysa ilk 24 saatin sonu ZATEN hedeftir; aşıyorsa
     tavan kadar ilerlenir. `Math.min` yerine yön çarpımı: ters yönde de
     doğru çalışsın. */
  const hedef = tekGunde ? istenenHedef : mevcut + yon * tavan;

  return {
    tavan,
    hedef: Math.round(hedef * 10) / 10,
    tekGunde,
    gun: Math.round((mutlak / tavan) * 10) / 10,
    delta,
  };
}

export type SuKlerensi = {
  /** Elektrolitsiz su klerensi — mL/gün. Artı: su atılıyor. */
  efwc: number;
  /** (İdrar Na + İdrar K) / Serum Na. */
  oran: number;
  /** İdrar elektrolit toplamı — mEq/L. */
  idrarTuz: number;
  yon: "atiyor" | "tutuyor" | "notr";
};

/**
 * ELEKTROLİTSİZ SU KLERENSİ (EFWC) — Adrogué-Madias'ın kör noktası.
 *
 * Formül KAPALI SİSTEM varsayıyor: hasta idrar yapmıyor, ter yok. Gerçekte
 * böbrek su ve tuzu ayrı ayrı işliyor ve serum sodyumunu bağımsız olarak
 * değiştiriyor. Bu, formülün bilinen ve yayımlanmış kısıtı.
 *
 *   EFWC = V × (1 − (UNa + UK) / SNa)
 *
 * Artı → hasta net serbest su ATIYOR, serum Na kendiliğinden yükselir.
 * Eksi → hasta net serbest su TUTUYOR, serum Na kendiliğinden düşer.
 */
export function suKlerensi(
  idrarHacmiMlGun: number,
  idrarNa: number,
  idrarK: number,
  serumNa: number
): SuKlerensi | null {
  if (![idrarHacmiMlGun, idrarNa, idrarK, serumNa].every(Number.isFinite)) return null;
  if (serumNa <= 0) return null;

  const idrarTuz = idrarNa + idrarK;
  const oran = idrarTuz / serumNa;
  const efwc = idrarHacmiMlGun * (1 - oran);

  return {
    efwc: Math.round(efwc),
    oran: Math.round(oran * 100) / 100,
    idrarTuz: Math.round(idrarTuz * 10) / 10,
    yon: efwc > 50 ? "atiyor" : efwc < -50 ? "tutuyor" : "notr",
  };
}

/**
 * DESALİNASYON — verilen sıvı sodyumu TERS yöne götürebilir.
 *
 * Kural: idrar (Na + K) toplamı, verilen sıvının sodyumundan YÜKSEKSE böbrek
 * o sıvının tuzunu atıp suyunu tutuyor demektir; net etki serum sodyumunu
 * DÜŞÜRMEK olur. SIADH'de izotonik salinin (154 mEq/L) hiponatremiyi
 * kötüleştirmesinin mekanizması budur.
 *
 * Adrogué-Madias bunu göremez — o yalnızca infüzatı ve TBW'yi biliyor, idrarı
 * bilmiyor. Bu yüzden burası bir ÇAPRAZ KONTROL: hesap değişmiyor, iki okuma
 * ayrıştığında söyleniyor.
 */
export function desalinasyonRiski(
  idrarTuz: number,
  infuzatNa: number
): { risk: boolean; fark: number } | null {
  if (!Number.isFinite(idrarTuz) || !Number.isFinite(infuzatNa)) return null;
  return {
    risk: idrarTuz > infuzatNa,
    fark: Math.round((idrarTuz - infuzatNa) * 10) / 10,
  };
}
