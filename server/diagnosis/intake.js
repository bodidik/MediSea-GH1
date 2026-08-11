// FILE: server/diagnosis/intake.js
//
// Kutulu girdiyi motorun anladigi duz forma cevirir.
//
//   { hpi: [...], exam: {...}, pmh: [...], meds: [...], fhx: [...], habits: [...] }
//        -> Map<bulguKodu, { present, box, inferred }>
//
// Kutular yalnizca arayuz duzeni degildir; iki gercek is yaparlar:
//
// 1) KAYNAK IZI. Hangi yuzdenin nereden geldigi trace'te gorunur: "Soygeçmiş:
//    ailede MEN1 -> x12". Klinisyen yanlis girilen kutuyu boylece yakalar.
//
// 2) MUAYENEDE ANLAMLI NEGATIF. "Batin muayenesi normal" cumlesi, o sistemin
//    TUM bulgularini YOK yapar. Muayene edilmemis sistem ise BILINMIYOR kalir.
//    Bu ikisi ayni sey degildir ve fark dogrudan yuzdeye yansir. Hikayede bu
//    genisletme YAPILAMAZ: hasta anlatmadi diye bulgu yok sayilamaz.

import { defaultKb } from './kb/index.js';
import { EXAM_SYSTEMS } from './kb/findings.js';

export const BOXES = {
  hpi: { label: 'Hikâye', order: 1 },
  exam: { label: 'Fizik muayene', order: 2 },
  pmh: { label: 'Özgeçmiş', order: 3 },
  meds: { label: 'İlaçlar', order: 4 },
  fhx: { label: 'Soygeçmiş', order: 5 },
  habits: { label: 'Alışkanlıklar', order: 6 },
};

export const BOX_IDS = Object.keys(BOXES);

/** [{code, present}] | {code: present} -> [[code, present]] */
function toPairs(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((f) => [f.code ?? f.id, f.present]);
  return Object.entries(raw);
}

/**
 * @param {object} caseInput  kutulu ve/veya duz (`findings`) girdi
 * @param {object} [kb]
 * @returns {{ entries: Map, warnings: string[], exam: object, boxCounts: object }}
 */
export function intake(caseInput = {}, kb = defaultKb) {
  const warnings = [];
  const entries = new Map();

  const put = (code, present, box, inferred = false) => {
    if (!kb.findings[code]) {
      warnings.push(`Bilinmeyen bulgu kodu atlandı: "${code}" (${BOXES[box]?.label ?? box})`);
      return;
    }
    if (present === null || present === undefined) return; // sorulmamis
    const value = Boolean(present);
    const existing = entries.get(code);
    if (existing && existing.present !== value) {
      // Cikarilmis negatif ile acikca yazilmis bulgu catisirsa, acikca
      // yazilan kazanir; muayene ozeti tek tek yazilani ezmemelidir.
      if (existing.inferred && !inferred) {
        entries.set(code, { present: value, box, inferred: false });
        return;
      }
      if (!existing.inferred && inferred) return;
      warnings.push(`Çelişkili bulgu "${code}": son değer kullanıldı`);
    }
    entries.set(code, { present: value, box, inferred });
  };

  // --- duz form (geriye donuk uyum): kutu, bulgunun kendi tanimindan gelir ---
  for (const [code, present] of toPairs(caseInput.findings)) {
    put(code, present, kb.findings[code]?.box ?? 'hpi');
  }

  // --- kutular ---
  for (const box of BOX_IDS) {
    if (box === 'exam') continue;
    for (const [code, present] of toPairs(caseInput[box])) put(code, present, box);
  }

  // --- fizik muayene ---
  const examRaw = caseInput.exam;
  const examBlock = Array.isArray(examRaw) ? { findings: examRaw } : (examRaw ?? {});
  for (const [code, present] of toPairs(examBlock.findings)) put(code, present, 'exam');

  const normalSystems = [];
  for (const system of examBlock.normalSystems ?? []) {
    if (!EXAM_SYSTEMS.includes(system)) {
      warnings.push(`Bilinmeyen muayene sistemi atlandı: "${system}"`);
      continue;
    }
    normalSystems.push(system);
  }

  let inferredNegatives = 0;
  for (const system of normalSystems) {
    for (const code of kb.findingIds) {
      if (kb.findings[code].system !== system) continue;
      if (entries.has(code)) continue;
      put(code, false, 'exam', true);
      inferredNegatives += 1;
    }
  }

  const boxCounts = {};
  for (const box of BOX_IDS) boxCounts[box] = 0;
  for (const e of entries.values()) boxCounts[e.box] = (boxCounts[e.box] ?? 0) + 1;

  return {
    entries,
    warnings,
    exam: {
      normalSystems,
      examinedSystems: [...new Set([
        ...normalSystems,
        ...[...entries].filter(([, e]) => e.box === 'exam' && !e.inferred)
          .map(([code]) => kb.findings[code].system).filter(Boolean),
      ])],
      inferredNegatives,
    },
    boxCounts,
  };
}

/**
 * Muayene edilmemis, ama mevcut ayirici tani icin onemli sistemleri soyler.
 * "Sirada hangi test" sorusunun bedava versiyonu: once muayeneyi tamamla.
 */
export function unexaminedSystems(differential, examInfo, options = {}) {
  const kb = options.kb ?? defaultKb;
  const done = new Set(examInfo.examinedSystems);
  const top = differential.slice(0, options.considerTop ?? 5);

  const scores = new Map();
  for (const system of EXAM_SYSTEMS) {
    if (done.has(system)) continue;
    let score = 0;
    for (const code of kb.findingIds) {
      if (kb.findings[code].system !== system) continue;
      for (const d of top) {
        const lr = kb.likelihoods[d.id]?.[code]?.pos ?? 1;
        if (lr > 1) score += d.probability * Math.log(lr);
      }
    }
    if (score > 0) scores.set(system, score);
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([system, score]) => ({ system, score }));
}
