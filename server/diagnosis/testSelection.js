// FILE: server/diagnosis/testSelection.js
//
// "Hangi test?" sorusunu maliyet/fayda ile yanitlar. Amac tani listesini
// dogrulamak degil, BELIRSIZLIGI en ucuza dusurmektir:
//
//   kazanc = H(mevcut) - Σ_r P(r) · H(sonra | r)      [bit]
//
// Her aday test, "pozitif cikarsa / negatif cikarsa" diye sanal olarak
// calistirilir. Bu, ozgullugu dusuk testlerin (PHQ-9, MoCA) neden az bilgi
// tasidigini kendiliginden ortaya cikarir.

import { defaultKb, resultProbability } from './kb/index.js';
import { entropy } from './engine.js';

export const COST_MODEL = {
  // Maliyeti bit basina kiyaslanabilir hale getiren olcekleme.
  costScale: 10,
  invasivenessWeight: 4,
};

function effectiveCost(test, model) {
  return 1 + test.cost / model.costScale + model.invasivenessWeight * test.invasiveness;
}

function toProbMap(differential) {
  const map = new Map();
  for (const d of differential) map.set(d.id, d.probability);
  return map;
}

/**
 * @param {Array} differential  diagnose() ciktisi
 * @param {object} [options] { kb, exclude: string[], top, costModel, includeResidual }
 */
export function recommendTests(differential, options = {}) {
  const kb = options.kb ?? defaultKb;
  const model = { ...COST_MODEL, ...(options.costModel ?? {}) };
  const exclude = new Set(options.exclude ?? []);
  const probs = toProbMap(differential);
  const h0 = entropy([...probs.values()]);

  const rows = [];
  for (const testId of kb.testIds) {
    if (exclude.has(testId)) continue;
    const test = kb.tests[testId];

    let expectedH = 0;
    const outcomes = [];

    for (const outcome of test.results) {
      let pResult = 0;
      const joint = new Map();
      for (const dxId of kb.diagnosisIds) {
        const j = (probs.get(dxId) ?? 0) * resultProbability(test, dxId, outcome.id);
        joint.set(dxId, j);
        pResult += j;
      }
      if (pResult <= 0) continue;

      const posterior = [];
      let topId = null;
      let topP = -1;
      for (const dxId of kb.diagnosisIds) {
        const p = joint.get(dxId) / pResult;
        posterior.push(p);
        if (p > topP) { topP = p; topId = dxId; }
      }

      const h = entropy(posterior);
      expectedH += pResult * h;
      outcomes.push({
        id: outcome.id,
        label: outcome.label,
        probability: pResult,
        entropyAfter: h,
        topDiagnosis: { id: topId, label: kb.diagnoses[topId].label, probability: topP },
      });
    }

    const gain = h0 - expectedH;
    const cost = effectiveCost(test, model);
    rows.push({
      id: testId,
      label: test.label,
      infoGainBits: gain,
      uncertaintyReductionPct: h0 > 0 ? (gain / h0) * 100 : 0,
      rawCost: test.cost,
      invasiveness: test.invasiveness,
      effectiveCost: cost,
      utility: gain / cost,
      outcomes,
    });
  }

  rows.sort((a, b) => b.utility - a.utility);
  const top = options.top ?? rows.length;
  return { entropyBefore: h0, recommendations: rows.slice(0, top) };
}

/**
 * Belirli bir taniyi kesinlestirmek/dislamak icin en ayirt edici test.
 * Olcut: taninin dogru oldugu varsayimi altinda beklenen kanit miktari
 *   Σ_r P(r|dx) · log2( P(r|dx) / P(r|¬dx) )
 * Bu, "bu tani gercekse test bana kac bit getirir" demektir; kirmizi bayrak
 * tanilarini dislamak icin dogru soru budur (entropi kazanci degil, cunku
 * dusuk olasilikli tani genel entropiyi zaten az etkiler).
 */
export function bestTestFor(dxId, differential, options = {}) {
  const kb = options.kb ?? defaultKb;
  const exclude = new Set(options.exclude ?? []);
  const probs = toProbMap(differential);
  const pDx = probs.get(dxId) ?? 0;

  let best = null;
  for (const testId of kb.testIds) {
    if (exclude.has(testId)) continue;
    const test = kb.tests[testId];
    let evidence = 0;
    for (const outcome of test.results) {
      const pGiven = resultProbability(test, dxId, outcome.id);
      if (pGiven <= 0) continue;
      let pooled = 0;
      let mass = 0;
      for (const otherId of kb.diagnosisIds) {
        if (otherId === dxId) continue;
        const w = probs.get(otherId) ?? 0;
        pooled += w * resultProbability(test, otherId, outcome.id);
        mass += w;
      }
      const pNot = mass > 1e-9 ? pooled / mass : (test.fallback[outcome.id] ?? 1e-6);
      evidence += pGiven * Math.log2(Math.max(pGiven, 1e-6) / Math.max(pNot, 1e-6));
    }
    const score = evidence / (1 + test.cost / COST_MODEL.costScale
      + COST_MODEL.invasivenessWeight * test.invasiveness);
    if (!best || score > best.score) {
      best = { id: testId, label: test.label, expectedEvidenceBits: evidence, score };
    }
  }
  return best ? { ...best, diagnosisProbability: pDx } : null;
}
