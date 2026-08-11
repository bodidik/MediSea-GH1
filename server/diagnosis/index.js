// FILE: server/diagnosis/index.js
//
// Tani motoru - genel API.
//
//   import { assess } from './diagnosis/index.js';
//   const r = assess({ age: 59, sex: 'M', durationMonths: 24, findings: [...] });
//
// Yuzdeler burada hesaplanir, LLM'de degil. LLM yalnizca serbest metni
// findings[] dizisine cevirmek icin kullanilir (Katman 1).

export { diagnose, entropy, tempoBucket, normalizeSex, DEFAULTS } from './engine.js';
export { intake, unexaminedSystems, BOXES, BOX_IDS } from './intake.js';
export { recommendTests, bestTestFor, COST_MODEL } from './testSelection.js';
export { redFlags, HARM_THRESHOLD } from './redFlags.js';
export {
  calibrationReport,
  calibrationCurve,
  multiclassBrier,
  logLoss,
  expectedCalibrationError,
  topKAccuracy,
} from './calibration.js';
export { extractCase, assembleCase } from './extract/extractor.js';
export { createAnthropicTransport, hasApiKey } from './extract/anthropicTransport.js';
export { buildKb, defaultKb } from './kb/index.js';
export { FINDINGS } from './kb/findings.js';
export { DIAGNOSES } from './kb/diagnoses.js';
export { TESTS } from './kb/tests.js';

import { diagnose } from './engine.js';
import { recommendTests } from './testSelection.js';
import { redFlags } from './redFlags.js';
import { unexaminedSystems } from './intake.js';
import { extractCase } from './extract/extractor.js';

/**
 * Tek cagride tam degerlendirme: ayirici tani + test onerisi + kirmizi bayrak.
 *
 * @param {object} caseInput
 * @param {object} [options] { kb, top, parsimonyWeight, clusterDiscount, costModel }
 */
export function assess(caseInput, options = {}) {
  const result = diagnose(caseInput, options);
  // Zaten yapilmis testler tekrar onerilmesin.
  const done = (caseInput.testResults ?? []).map((r) => r.test ?? r.id).filter(Boolean);

  const { entropyBefore, recommendations } = recommendTests(result.differential, {
    ...options,
    exclude: done,
    top: options.top ?? 5,
  });

  return {
    ...result,
    entropyBefore,
    nextTests: recommendations,
    // Test istemeden once bedava olan adim: eksik muayene sistemleri.
    missingExam: unexaminedSystems(result.differential, result.exam, options),
    redFlags: redFlags(result.differential, { ...options, exclude: done }),
  };
}

/**
 * Uctan uca: serbest metin -> yuzdesel on tani + test onerisi.
 *
 * Cikarim uyarilari (uydurulan bulgu, temellendirilemeyen alinti, duzeltilen
 * kutu) motor uyarilarindan AYRI tutulur: ikisinin kaynagi ve anlami farklidir,
 * karistirilirsa hangi katmanin hata yaptigi gorunmez olur.
 *
 * @param {string} text
 * @param {object} options  extractCase secenekleri + assess secenekleri
 *   (complete taşıyıcısı zorunlu)
 */
export async function assessText(text, options = {}) {
  const extraction = await extractCase(text, options);
  const result = assess(extraction.case, options);
  return {
    ...result,
    extraction: {
      warnings: extraction.warnings,
      notes: extraction.notes,
      stats: extraction.stats,
      priorDiagnoses: extraction.priorDiagnoses,
      case: extraction.case,
    },
  };
}
