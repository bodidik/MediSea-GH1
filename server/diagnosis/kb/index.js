// FILE: server/diagnosis/kb/index.js
//
// Bilgi tabanini birlestirir, dogrular ve turetilmis alanlari hesaplar.
// Dogrulama yukleme aninda calisir: bozuk bir KB ile sessizce yanlis yuzde
// uretmektense patlamak yeglenir.

import { FINDINGS } from './findings.js';
import { DIAGNOSES } from './diagnoses.js';
import { LIKELIHOODS } from './likelihoods.js';
import { TESTS } from './tests.js';

const PROB_SUM_TOLERANCE = 1e-6;

// Bir bulguyu "acikliyor" saymak icin gereken en dusuk LR+. 1.0 (notr)
// aciklama degildir; tekillik cezasi tam olarak bu esikten beslenir.
export const EXPLAIN_THRESHOLD = 1.2;

// Salience normalizasyonu: LR+ = 20 olan bir bulgu tam agirlik (1.0) alir.
const SALIENCE_CEILING = 20;

function normalizePair(entry) {
  if (Array.isArray(entry)) {
    const [pos, neg = 1] = entry;
    return { pos, neg };
  }
  return { pos: entry, neg: 1 };
}

/** LIKELIHOODS'u [LR+, LR-] kisayollarindan tekdüze forma acar. */
function buildLikelihoodIndex({ FINDINGS, DIAGNOSES, LIKELIHOODS, DIAGNOSIS_IDS }, errors) {
  const index = {};
  for (const dxId of Object.keys(LIKELIHOODS)) {
    if (!DIAGNOSES[dxId]) errors.push(`LIKELIHOODS: bilinmeyen tanı "${dxId}"`);
    index[dxId] = {};
    for (const [findingId, raw] of Object.entries(LIKELIHOODS[dxId])) {
      if (!FINDINGS[findingId]) {
        errors.push(`LIKELIHOODS["${dxId}"]: bilinmeyen bulgu "${findingId}"`);
        continue;
      }
      const { pos, neg } = normalizePair(raw);
      if (!(pos > 0) || !(neg > 0)) {
        errors.push(`LIKELIHOODS["${dxId}"]["${findingId}"]: LR pozitif olmalı`);
        continue;
      }
      index[dxId][findingId] = { pos, neg };
    }
  }
  for (const dxId of DIAGNOSIS_IDS) {
    if (!index[dxId]) index[dxId] = {};
  }
  return index;
}

/**
 * Bulgunun ayirt edicilik agirligi. Elle yazilmaz: matristeki en yuksek LR+'dan
 * turetilir, boylece KB degistikce kendiliginden guncellenir.
 * Yorgunluk gibi her yerde gecen bir bulgu ile bobrek tasi oykusu ayni
 * agirlikta sayilmasin diye tekillik cezasinda kullanilir.
 */
function buildSalience(likelihoodIndex, { FINDING_IDS, DIAGNOSIS_IDS }) {
  const salience = {};
  const denom = Math.log(SALIENCE_CEILING);
  for (const findingId of FINDING_IDS) {
    let maxPos = 1;
    for (const dxId of DIAGNOSIS_IDS) {
      const lr = likelihoodIndex[dxId]?.[findingId];
      if (lr && lr.pos > maxPos) maxPos = lr.pos;
    }
    salience[findingId] = Math.min(1, Math.max(0, Math.log(maxPos) / denom));
  }
  return salience;
}

function validateDiagnoses({ DIAGNOSES }, errors) {
  for (const [dxId, dx] of Object.entries(DIAGNOSES)) {
    if (!(dx.prevalence > 0 && dx.prevalence < 1)) {
      errors.push(`DIAGNOSES["${dxId}"]: prevalence 0-1 aralığında olmalı`);
    }
    if (!(dx.severity >= 0 && dx.severity <= 1)) {
      errors.push(`DIAGNOSES["${dxId}"]: severity 0-1 aralığında olmalı`);
    }
    for (const bucket of ['acute', 'subacute', 'chronic']) {
      if (!(dx.tempo?.[bucket] > 0)) {
        errors.push(`DIAGNOSES["${dxId}"]: tempo.${bucket} eksik veya pozitif değil`);
      }
    }
    const ranges = dx.demographics?.age ?? [];
    if (!ranges.length) errors.push(`DIAGNOSES["${dxId}"]: demographics.age boş`);
    for (const [min, max, factor] of ranges) {
      if (!(min <= max) || !(factor > 0)) {
        errors.push(`DIAGNOSES["${dxId}"]: geçersiz yaş aralığı [${min},${max},${factor}]`);
      }
    }
  }
}

function validateTests({ DIAGNOSES, TESTS }, errors) {
  for (const [testId, test] of Object.entries(TESTS)) {
    const resultIds = test.results.map((r) => r.id);
    if (new Set(resultIds).size !== resultIds.length) {
      errors.push(`TESTS["${testId}"]: sonuç id'leri tekrar ediyor`);
    }
    if (!(test.cost >= 0) || !(test.invasiveness >= 0 && test.invasiveness <= 1)) {
      errors.push(`TESTS["${testId}"]: cost/invasiveness geçersiz`);
    }

    const check = (dist, where) => {
      let sum = 0;
      for (const [resultId, prob] of Object.entries(dist)) {
        if (!resultIds.includes(resultId)) {
          errors.push(`${where}: bilinmeyen sonuç "${resultId}"`);
        }
        if (!(prob >= 0 && prob <= 1)) errors.push(`${where}: olasılık 0-1 dışında`);
        sum += prob;
      }
      for (const resultId of resultIds) {
        if (!(resultId in dist)) errors.push(`${where}: "${resultId}" için olasılık yok`);
      }
      if (Math.abs(sum - 1) > PROB_SUM_TOLERANCE) {
        errors.push(`${where}: olasılıklar 1'e toplanmıyor (${sum.toFixed(4)})`);
      }
    };

    check(test.fallback, `TESTS["${testId}"].fallback`);
    for (const [dxId, dist] of Object.entries(test.p ?? {})) {
      if (!DIAGNOSES[dxId]) errors.push(`TESTS["${testId}"].p: bilinmeyen tanı "${dxId}"`);
      check(dist, `TESTS["${testId}"].p["${dxId}"]`);
    }
  }
}

/**
 * @param {object} [overrides] Test amacli parca degistirme:
 *   buildKb({ tests: { bozuk: {...} } }) -> dogrulayici hata firlatmali.
 */
export function buildKb(overrides = {}) {
  const src = {
    FINDINGS: overrides.findings ?? FINDINGS,
    DIAGNOSES: overrides.diagnoses ?? DIAGNOSES,
    LIKELIHOODS: overrides.likelihoods ?? LIKELIHOODS,
    TESTS: overrides.tests ?? TESTS,
  };
  src.FINDING_IDS = Object.keys(src.FINDINGS);
  src.DIAGNOSIS_IDS = Object.keys(src.DIAGNOSES);

  const errors = [];
  const likelihoods = buildLikelihoodIndex(src, errors);
  validateDiagnoses(src, errors);
  validateTests(src, errors);
  if (errors.length) {
    throw new Error(`Bilgi tabanı geçersiz:\n  - ${errors.join('\n  - ')}`);
  }
  return {
    findings: src.FINDINGS,
    findingIds: src.FINDING_IDS,
    diagnoses: src.DIAGNOSES,
    diagnosisIds: src.DIAGNOSIS_IDS,
    likelihoods,
    salience: buildSalience(likelihoods, src),
    tests: src.TESTS,
    testIds: Object.keys(src.TESTS),
  };
}

/** P(sonuc | tani) — tabloda yoksa fallback dagilimi. */
export function resultProbability(test, dxId, resultId) {
  const dist = test.p?.[dxId] ?? test.fallback;
  return dist[resultId] ?? 0;
}

export const defaultKb = buildKb();
