// ⚓ MEDISEA CORE MEDICAL CALCULATION UTILITIES (Next.js 15 & TS Compliant)

export type Sex = "male" | "female";

/**
 * 0. Kullanıcı girdisini güvenli şekilde sayıya çevirir.
 * Hem nokta (8.5) hem virgül (8,5 - TR klavye alışkanlığı) ondalık ayracını kabul eder.
 * NOT: Bu proje genelinde sayısal <input>'lar type="text" + inputMode="decimal"
 * olarak tutulur; type="number" KULLANILMAZ çünkü tarayıcılar "8," veya "8." gibi
 * geçici/yarım girdilerde e.target.value'yu boş string'e çevirip alanı siliyor.
 */
export function parseLocaleNumber(input: string | number | undefined | null): number {
  if (typeof input === "number") return isNaN(input) ? 0 : input;
  if (!input) return 0;
  const normalized = String(input).replace(",", ".").trim();
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}

/**
 * 1. eGFR (CKD-EPI 2021) Hesaplayıcı - Race-Free Standartı
 */
export function egfrCkdEpi2021(scr: number, age: number, sex: Sex): number {
  if (!scr || !age) return 0;
  
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