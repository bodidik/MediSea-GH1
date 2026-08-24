// ⚓ MEDISEA CORE MEDICAL CALCULATION UTILITIES (Next.js 15 & TS Compliant)

export type Sex = "male" | "female";

/**
 * 0. Kullanıcı girdisini güvenli şekilde sayıya çevirir.
 * Hem nokta (8.5) hem virgül (8,5 - TR klavye alışkanlığı) ondalık ayracını kabul eder.
 * NOT: Bu proje genelinde sayısal <input>'lar type="text" + inputMode="decimal"
 * olarak tutulur; type="number" KULLANILMAZ çünkü tarayıcılar "8," veya "8." gibi
 * geçici/yarım girdilerde e.target.value'yu boş string'e çevirip alanı siliyor.
 */
/**
 * BİNLİK AYIRICI — ölçülmüş bir kusurdan doğdu.
 *
 * Türkçede nokta BİNLİK, virgül ONDALIK ayırıcıdır. Eski sürüm yalnızca
 * virgülü tanıyordu ve `parseFloat` gerisini yanlış okuyordu. Canlıda
 * ölçüldü, en ağır vaka `antikoagulan-geri-dondurme`:
 *
 *     5000  Ü heparin  ->  50 mg protamin     doğru
 *     5.000 Ü heparin  ->  0.1 mg protamin    500 KAT DÜŞÜK
 *
 * Aktif kanamada verilen bir geri döndürme ajanında, uyarı olmadan.
 *
 * VAKALAR EŞİT DEĞİL; yalnızca BELİRSİZ OLMAYANLAR düzeltildi:
 *
 *   "1 200"     boşluk gruplama      -> 1200     (hiçbir dil boşluğu ondalık saymaz)
 *   "1.200,5"   nokta grup + virgül  -> 1200.5   (Türkçe, tek okuma var)
 *   "1.2345"    dört+ hane           -> 1.2345   (zaten doğruydu, korunuyor)
 *
 * "1.200" (nokta + TAM 3 hane, başka işaret yok) BİLEREK DOKUNULMADI:
 * TR'de 1200, EN'de 1.2 demek ve sessizce tahmin etmek yeni bir yanlış
 * sayı sınıfı açardı. Bugünkü davranışı (1.2) aynen sürüyor.
 *
 * Çoklu nokta ("1.200.000") da belirsiz DEĞİL ama listede yoktu; bugünkü
 * davranışı korunuyor, karar bekliyor.
 *
 * Sözleşmenin geri kalanı DEĞİŞMEDİ: çözülemeyen her şey 0 döndürür (42 araç
 * buna dayanıyor) ve boş/`0` ayrımı `sayiGirildiMi` ile yapılır.
 */
/**
 * Ham girdiyi TEK bir kurala göre "JS'in okuyabileceği" biçime getirir.
 *
 * Neden ayrı fonksiyon: bu normalizasyon İKİ yerde birden gerekiyor —
 * `parseLocaleNumber` (sayıya çevirir) ve `sayiGirildiMi` (alan sayı ile mi
 * dolduruldu). İkisi kendi ölçütünü taşırsa AYRIŞIYORLAR ve ayrışma sessiz.
 *
 * ÖLÇÜLDÜ: binlik ayırıcı düzeltmesi yalnızca `parseLocaleNumber`a konduğunda
 * `antikoagulan-geri-dondurme` "3 000" girdisini HİÇ hesaplamıyordu —
 * ayrıştırıcı 3000 okuyor, kapı ham dizeye kendi katı regex'ini uygulayıp
 * reddediyordu. Aynı girdi, kapısı olmayan `pni`de 36.0 üretiyordu: tek
 * uygulamada aynı girdi için İKİ davranış.
 *
 * Karakter sınıfı sadeleşti: eski sürüm `[.\s ]` içinde ayrıca görünmez bir
 * NBSP taşıyordu; JS'de `\s` zaten U+00A0'yı kapsar, yani davranış aynı
 * (26 vakalık matris NBSP girdileriyle birlikte doğruladı).
 */
function sayiNormalize(ham: string): string {
  /* A) TEK virgül varsa: virgül ondalık, nokta ve boşluk GRUP ayırıcıdır.
        Birden çok virgül bozuk girdidir — tahmin edilmez, C'ye düşer. */
  if ((ham.match(/,/g) || []).length === 1) {
    const [tam, kesir] = ham.split(",");
    return `${tam.replace(/[.\s]/g, "")}.${kesir}`;
  }

  /* B) Virgül yok ama RAKAM GRUPLARI boşlukla ayrılmış: boşluk yalnızca grup
        olabilir. Kalıp katı tutuldu ki "1 abc" gibi girdiler buraya düşmesin. */
  if (/^[+-]?\d{1,3}(?:\s\d{3})+(?:\.\d+)?$/.test(ham)) {
    return ham.replace(/\s/g, "");
  }

  /* C) Geri kalan her şey: ESKİ DAVRANIŞ birebir korunuyor. */
  return ham.replace(",", ".");
}

export function parseLocaleNumber(input: string | number | undefined | null): number {
  if (typeof input === "number") return isNaN(input) ? 0 : input;
  if (!input) return 0;

  const n = parseFloat(sayiNormalize(String(input).trim()));
  return isNaN(n) ? 0 : n;
}

/**
 * 0b. Alan GERÇEKTEN sayı ile dolduruldu mu?
 *
 * `parseLocaleNumber` çözemediği her şeye 0 döndürüyor (sözleşmesi bu ve 42
 * araç ona dayandığı için DEĞİŞTİRİLMEDİ). Bunun sonucu şu: bir kapı
 * `Number.isFinite(parseLocaleNumber(x))` yazarsa ÇÖP GİRDİYİ DE GEÇİRİR,
 * çünkü 0 sonludur. Ölçüldü — cdai, sdai ve dapsa tam olarak bu kapıya
 * sahipti ve alanlara "abc" yazmak "0 · REMİSYON" bastırıyordu.
 *
 * Bu yardımcı HAM DİZEYE bakıyor: boş alan ile "0" girilmiş alan farklıdır
 * (meşru sıfır), "abc" ise hiç sayı değildir.
 */
export function sayiGirildiMi(ham: string | number | undefined | null): boolean {
  if (typeof ham === "number") return Number.isFinite(ham);
  if (typeof ham !== "string") return false;
  /* Kapı, ayrıştırıcıyla AYNI normalizasyonu kullanır; ayrı ölçüt taşırsa
     ayrışır (yukarıdaki `sayiNormalize` yorumunda ölçülmüş vaka var). */
  const t = sayiNormalize(ham.trim());
  if (t === "") return false;
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(t);
}

/**
 * 1. eGFR (CKD-EPI 2021) Hesaplayıcı - Race-Free Standartı
 */
export function egfrCkdEpi2021(scr: number, age: number, sex: Sex): number {
  /**
   * NEGATİF KREATİNİN `NaN` ÜRETİYORDU — ve ekrana düz "NaN" basılıyordu.
   *
   * Sebep aşağıdaki `** alpha`: `alpha` kesirli (-0.302) ve JavaScript'te
   * negatif tabanın kesirli üssü NaN. Ölçüldü: scr = -5 → NaN, scr = -0.1 → NaN.
   *
   * Bu dosyadaki 15 fonksiyondan yalnızca bu, kullanıcı girdisini kesirli
   * üsse alıyor; yani sınıf tek araçla sınırlı.
   *
   * Sıfır/negatif/sonsuz girdi zaten hesaplanamaz — sözleşmeye uyup 0
   * dönüyoruz. 0'ın kullanıcıya SAYI olarak gösterilmemesi çağıranın işi
   * (bkz. app/tools/egfr/page.tsx): "0 mL/dk" makul görünen kritik bir
   * değer ve çöp girdiden üretilmemeli.
   */
  if (!Number.isFinite(scr) || !Number.isFinite(age)) return 0;
  if (scr <= 0 || age <= 0) return 0;
  
  const isFemale = sex === "female";
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const genderScale = isFemale ? 1.012 : 1.0;

  const term1 = Math.min(scr / kappa, 1) ** alpha;
  const term2 = Math.max(scr / kappa, 1) ** -1.200;
  const term3 = 0.9938 ** age;

  const val = 142 * term1 * term2 * term3 * genderScale;
  return Math.round(val * 10) / 10; // Örn: 94.5
}

/**
 * 2. Düzeltilmiş Kalsiyum (Corrected Calcium) Hesaplayıcı
 */
export function correctedCalciumMgdl(calcium: number, albumin: number): number {
  if (!calcium || !albumin) return 0;
  const val = calcium + 0.8 * (4.0 - albumin);
  return Math.round(val * 100) / 100;
}

/**
 * 3. Tıbbi Birim Dönüştürücüler
 */
export function mgdlToMmol(mgdl: number, factor: number = 18): number {
  if (!mgdl) return 0;
  return Math.round((mgdl / factor) * 100) / 100;
}

export function mmolToMgdl(mmol: number, factor: number = 18): number {
  if (!mmol) return 0;
  return Math.round((mmol * factor) * 100) / 100;
}

/**
 * 4. SOFA Skoru Hesaplayıcı (Placeholder & Core Interface)
 * Diğer sayfaların çökmemesi için skor toplama altyapısı
 */
export function calculateSofaScore(scores: {
  respiration: number;
  coagulation: number;
  liver: number;
  cardiovascular: number;
  cns: number;
  renal: number;
}): number {
  return (
    (scores.respiration || 0) +
    (scores.coagulation || 0) +
    (scores.liver || 0) +
    (scores.cardiovascular || 0) +
    (scores.cns || 0) +
    (scores.renal || 0)
  );
}

/**
 * 5. PERC (Pulmonary Embolism Rule-out Criteria) Kontrolü
 */
export function checkPercCriteria(criteria: Record<string, boolean>): boolean {
  // Tüm kriterler false ise (yani hiçbir risk faktörü yoksa) PERC negatiftir (hasta güvendedir)
  return Object.values(criteria).every((val) => !val);
}

/**
 * 6. Wells DVT Skoru Hesaplayıcı
 */
export function calculateWellsDvt(
  criteria: Record<string, boolean>,
  alternativeDiagnosisMinusTwo: boolean
): number {
  let score = 0;
  Object.values(criteria).forEach((val) => {
    if (val) score += 1;
  });
  if (alternativeDiagnosisMinusTwo) score -= 2;
  return score;
}

/**
 * 7. Anyon Açığı (Anion Gap)
 * AG = Na - (Cl + HCO3). Normal aralık yaklaşık 8-12 mEq/L (laboratuvara göre değişir).
 */
export function anionGap(na: number, cl: number, hco3: number): number {
  if (!na || !cl || !hco3) return 0;
  return Math.round((na - (cl + hco3)) * 10) / 10;
}

/**
 * 7b. Albumin Düzeltmeli Anyon Açığı
 * Hipoalbüminemi anyon açığını gizleyebilir; her 1 g/dL albumin düşüşü için AG'ye +2.5 eklenir.
 */
export function correctedAnionGap(ag: number, albumin: number): number {
  if (!albumin) return ag;
  return Math.round((ag + 2.5 * (4.0 - albumin)) * 10) / 10;
}

/**
 * 8. Hiperglisemide Düzeltilmiş Sodyum (Katz Formülü)
 * Her 100 mg/dL glukoz artışı için ölçülen Na'ya +1.6 mEq/L eklenir.
 */
export function correctedSodium(na: number, glucose: number): number {
  if (!na || !glucose) return 0;
  return Math.round((na + 1.6 * ((glucose - 100) / 100)) * 10) / 10;
}

/**
 * 9. HbA1c -> Tahmini Ortalama Glukoz (ADA/NGSP Formülü, mg/dL)
 * eAG = 28.7 * A1c - 46.7
 */
export function hba1cToEagMgdl(a1c: number): number {
  if (!a1c) return 0;
  return Math.round(28.7 * a1c - 46.7);
}

/**
 * 10. Vücut Yüzey Alanı (Mosteller Formülü) - m²
 * BSA = sqrt((boy_cm * kilo_kg) / 3600)
 */
export function bsaMosteller(heightCm: number, weightKg: number): number {
  if (!heightCm || !weightKg) return 0;
  return Math.round(Math.sqrt((heightCm * weightKg) / 3600) * 100) / 100;
}

/**
 * 11. DAS28-ESR (Romatoid Artrit Hastalık Aktivite Skoru)
 * DAS28-ESR = 0.56*sqrt(TJC28) + 0.28*sqrt(SJC28) + 0.70*ln(ESR) + 0.014*GH
 * TJC/SJC: 0-28 hassas/şiş eklem sayısı, ESR: mm/saat, GH: hasta genel değerlendirmesi (0-100 VAS)
 */
export function das28Esr(tjc28: number, sjc28: number, esr: number, gh: number): number {
  const safeEsr = Math.max(esr, 1); // ln(0) tanımsız — pratikte ESR>=1 varsayılır
  const val = 0.56 * Math.sqrt(tjc28) + 0.28 * Math.sqrt(sjc28) + 0.70 * Math.log(safeEsr) + 0.014 * gh;
  return Math.round(val * 100) / 100;
}

/**
 * 11b. DAS28-CRP
 * DAS28-CRP = 0.56*sqrt(TJC28) + 0.28*sqrt(SJC28) + 0.36*ln(CRP+1) + 0.014*GH + 0.96
 */
export function das28Crp(tjc28: number, sjc28: number, crp: number, gh: number): number {
  const val = 0.56 * Math.sqrt(tjc28) + 0.28 * Math.sqrt(sjc28) + 0.36 * Math.log(crp + 1) + 0.014 * gh + 0.96;
  return Math.round(val * 100) / 100;
}