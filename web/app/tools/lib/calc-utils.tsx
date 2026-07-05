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