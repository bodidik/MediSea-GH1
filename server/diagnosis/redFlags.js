// FILE: server/diagnosis/redFlags.js
//
// Kacirilmamasi gereken tanilar AYRI bir eksende durur. Olasilik listesine
// karistirilmazlar: dusuk olasilikli ama oldurucu bir tani, yuzde siralamasinda
// hep dipte kalir ve tam da bu yuzden kacirilir.
//
// Olcut beklenen zarar:  P(tani) × ciddiyet
// Bu bir "olasilik" degildir; oncelik sirasidir.

import { defaultKb } from './kb/index.js';
import { bestTestFor } from './testSelection.js';

export const HARM_THRESHOLD = 0.01; // P × severity

/**
 * @param {Array} differential diagnose() ciktisi
 * @param {object} [options] { kb, threshold, exclude, minSeverity }
 */
export function redFlags(differential, options = {}) {
  const kb = options.kb ?? defaultKb;
  const threshold = options.threshold ?? HARM_THRESHOLD;
  const minSeverity = options.minSeverity ?? 0.6;

  const rows = differential
    .filter((d) => !d.isResidual && (kb.diagnoses[d.id]?.severity ?? 0) >= minSeverity)
    .map((d) => {
      const severity = kb.diagnoses[d.id].severity;
      const expectedHarm = d.probability * severity;
      return {
        id: d.id,
        label: d.label,
        probability: d.probability,
        severity,
        expectedHarm,
        actionable: expectedHarm >= threshold,
        discriminatingTest: bestTestFor(d.id, differential, {
          kb,
          exclude: options.exclude ?? [],
        }),
      };
    })
    .sort((a, b) => b.expectedHarm - a.expectedHarm);

  return {
    threshold,
    items: rows,
    // Klinisyene tek cumlelik uyari: dislanmasi gerekenler.
    mustExclude: rows.filter((r) => r.actionable),
  };
}
