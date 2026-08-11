// FILE: server/diagnosis/engine.js
//
// Bayes motoru. Yuzdeleri LLM degil bu dosya hesaplar; LLM'in isi yalnizca
// serbest metni bulgu koduna cevirmektir. Motor deterministiktir ve her adimi
// izlenebilir (trace) doner - klinisyen guveni oradan gelir.
//
//   log-odds(tani) = log-odds(on-test) + Σ log(LR_i) - tekillik_cezasi
//
// Uc ekleme naif Bayes'in bilinen kusurlarini kapatir:
//   1) uclu bulgu mantigi (var / yok / sorulmamis)
//   2) korele bulgu kumelerinde indirim (ayni kaniti iki kez sayma)
//   3) tekillik cezasi (bkz. asagida)

import { defaultKb, EXPLAIN_THRESHOLD } from './kb/index.js';
import { isRiskFactor } from './kb/findings.js';
import { intake, BOXES } from './intake.js';

export const DEFAULTS = {
  // Aciklanmayan her bulgu, "demek ki ikinci bir hastalik daha var" demektir.
  // Ikinci hastalik a priori olasiliksizdir; ceza bu on bilgiyi temsil eder.
  // Bu terim olmadan motor tek hastaya dort ayri tani yazar.
  parsimonyWeight: 0.9,
  // Ayni kumeden gelen ikinci ve sonraki bulgular indirimli sayilir.
  clusterDiscount: 0.35,
  // On-test olasiligi bu araligin disina tasmaz.
  priorClamp: [0.0002, 0.6],
  // Yas x cinsiyet x seyir carpanlari birbirine binip on-testi sisirebiliyor
  // (or. 1.3 x 1.6 x 1.3 = 2.7). Bilesik carpan siniri bunu engeller.
  modifierClamp: [0.1, 3],
};

const SEX_ALIASES = {
  m: 'M', male: 'M', erkek: 'M', e: 'M',
  f: 'F', female: 'F', kadin: 'F', 'kadın': 'F', k: 'F',
};

export function normalizeSex(sex) {
  if (!sex) return null;
  return SEX_ALIASES[String(sex).trim().toLowerCase()] ?? null;
}

/** Sure bir bulgu degil, tum LR'leri module eden ayri bir eksendir. */
export function tempoBucket(durationMonths) {
  if (durationMonths == null) return 'subacute';
  if (durationMonths < 1) return 'acute';
  if (durationMonths <= 6) return 'subacute';
  return 'chronic';
}

function ageFactor(dx, age) {
  if (age == null) return 1;
  for (const [min, max, factor] of dx.demographics.age) {
    if (age >= min && age <= max) return factor;
  }
  return 1;
}

function sexFactor(dx, sex) {
  if (!sex) return 1;
  return dx.demographics.sex?.[sex] ?? 1;
}

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const toOdds = (p) => p / (1 - p);
const fromLogOdds = (l) => 1 / (1 + Math.exp(-l));

/**
 * Girdiyi tekdüze hale getirir ve tanimsiz bulgu kodlarini uyari olarak
 * toplar. Sessizce yutmak, cikarim katmanindaki hatalari gorunmez kilar.
 */
function normalizeCase(caseInput, kb) {
  const collected = intake(caseInput, kb);
  const warnings = [...collected.warnings];
  const state = collected.entries; // findingId -> { present, box, inferred }

  const sex = normalizeSex(caseInput.sex);
  if (caseInput.sex && !sex) warnings.push(`Cinsiyet anlaşılamadı: "${caseInput.sex}"`);

  const age = Number.isFinite(caseInput.age) ? caseInput.age : null;
  if (caseInput.age != null && age === null) warnings.push(`Yaş anlaşılamadı: "${caseInput.age}"`);

  const results = [];
  for (const r of caseInput.testResults ?? []) {
    const testId = r.test ?? r.id;
    const test = kb.tests[testId];
    if (!test) {
      warnings.push(`Bilinmeyen test atlandı: "${testId}"`);
      continue;
    }
    if (!test.results.some((o) => o.id === r.result)) {
      warnings.push(`"${testId}" için geçersiz sonuç: "${r.result}"`);
      continue;
    }
    results.push({ testId, test, resultId: r.result });
  }

  return {
    age,
    sex,
    tempo: caseInput.tempo ?? tempoBucket(caseInput.durationMonths),
    state,
    results,
    warnings,
    exam: collected.exam,
    boxCounts: collected.boxCounts,
  };
}

function priorFor(dx, patient, opts) {
  const modifier = clamp(
    ageFactor(dx, patient.age) * sexFactor(dx, patient.sex) * (dx.tempo[patient.tempo] ?? 1),
    opts.modifierClamp[0],
    opts.modifierClamp[1],
  );
  return clamp(dx.prevalence * modifier, opts.priorClamp[0], opts.priorClamp[1]);
}

/**
 * Bir tani icin bulgu kanitini toplar. Korele bulgular (cluster) icinde
 * yalnizca en guclusu tam agirlikla girer; digerleri indirimlidir.
 */
function collectFindingEvidence(dxId, patient, kb, opts) {
  const buckets = new Map();

  for (const [findingId, entry] of patient.state) {
    const lrPair = kb.likelihoods[dxId]?.[findingId];
    const lr = entry.present ? (lrPair?.pos ?? 1) : (lrPair?.neg ?? 1);
    const logLR = Math.log(lr);
    if (logLR === 0) continue;

    const cluster = kb.findings[findingId].cluster ?? `@${findingId}`;
    if (!buckets.has(cluster)) buckets.set(cluster, []);
    buckets.get(cluster).push({ findingId, entry, lr, logLR });
  }

  const contributions = [];
  for (const [cluster, items] of buckets) {
    items.sort((a, b) => Math.abs(b.logLR) - Math.abs(a.logLR));
    items.forEach((item, i) => {
      const weight = i === 0 ? 1 : opts.clusterDiscount;
      contributions.push({
        source: 'finding',
        code: item.findingId,
        label: kb.findings[item.findingId].label,
        present: item.entry.present,
        box: item.entry.box,
        boxLabel: BOXES[item.entry.box]?.label ?? item.entry.box,
        inferred: item.entry.inferred,
        axis: isRiskFactor(item.findingId) ? 'risk' : 'manifestation',
        lr: item.lr,
        weight,
        logLR: item.logLR * weight,
        cluster: cluster.startsWith('@') ? null : cluster,
        discounted: weight !== 1,
      });
    });
  }
  return contributions;
}

/**
 * Tekillik (parsimony) cezasi: taninin aciklamadigi, VAR olan BELIRTILER.
 * Agirlik olarak bulgunun ayirt ediciligi (salience) kullanilir - yorgunluk
 * ile bobrek tasi oykusu ayni cezayi dogurmasin diye.
 *
 * Risk faktorleri (soygecmis, meslek, ilac, aliskanlik) bu cezanin DISINDADIR.
 * Hastanin meslegini ya da babasinin hastaligini "aciklamadigi" icin bir taniyi
 * cezalandirmak anlamsizdir; risk bir belirti degil, on kosuldur. Bu ayrim
 * olmadan tek bir maruziyet kaydi tum listeyi carpitir.
 */
function parsimonyPenalty(dxId, patient, kb, opts) {
  if (kb.diagnoses[dxId].isResidual) {
    return { logLR: 0, unexplained: [], weight: 0 };
  }
  const unexplained = [];
  let weight = 0;
  for (const [findingId, entry] of patient.state) {
    if (!entry.present) continue;
    if (isRiskFactor(findingId)) continue;
    const lrPos = kb.likelihoods[dxId]?.[findingId]?.pos ?? 1;
    if (lrPos >= EXPLAIN_THRESHOLD) continue;
    const s = kb.salience[findingId] ?? 0;
    if (s === 0) continue;
    unexplained.push({
      code: findingId,
      label: kb.findings[findingId].label,
      box: entry.box,
      salience: s,
    });
    weight += s;
  }
  return { logLR: -opts.parsimonyWeight * weight, unexplained, weight };
}

/**
 * Test sonucunun LR'si baglamdan turetilir:
 *   LR(dx) = P(r | dx) / P(r | ¬dx)
 * Paydadaki "¬dx" havuzu, bu testten ONCEKI dagilimla agirliklandirilir; yani
 * ayni sonuc, farkli bir on-test tablosunda farkli agirlik tasir. Testler
 * sirayla uygulanir ve her biri kendinden onceki dagilimi kullanir.
 */
function testResultLogLRs(test, resultId, current, kb) {
  const out = new Map();
  const pr = new Map();
  let total = 0;
  for (const dxId of kb.diagnosisIds) {
    const dist = test.p?.[dxId] ?? test.fallback;
    const p = dist[resultId] ?? 0;
    pr.set(dxId, p);
    total += (current.get(dxId) ?? 0) * p;
  }

  for (const dxId of kb.diagnosisIds) {
    const pDx = current.get(dxId) ?? 0;
    const pResultGivenDx = pr.get(dxId);
    const restMass = 1 - pDx;
    // Tek bir tani neredeyse tum kutleyi tutuyorsa "¬dx" havuzu bos kalir;
    // o durumda fallback dagilimina duseriz.
    const pResultGivenNot = restMass > 1e-9
      ? (total - pDx * pResultGivenDx) / restMass
      : (test.fallback[resultId] ?? 1e-6);

    const num = Math.max(pResultGivenDx, 1e-6);
    const den = Math.max(pResultGivenNot, 1e-6);
    out.set(dxId, Math.log(num / den));
  }
  return out;
}

/**
 * Ana giris noktasi.
 *
 * @param {object} caseInput
 *   { age, sex, durationMonths|tempo, findings: [{code, present}], testResults: [{test, result}] }
 * @param {object} [options] { kb, parsimonyWeight, clusterDiscount, priorClamp }
 * @returns {{ differential, warnings, patient, entropyBits }}
 */
export function diagnose(caseInput = {}, options = {}) {
  const kb = options.kb ?? defaultKb;
  const opts = { ...DEFAULTS, ...options };
  const patient = normalizeCase(caseInput, kb);

  const rows = kb.diagnosisIds.map((dxId) => {
    const dx = kb.diagnoses[dxId];
    const prior = priorFor(dx, patient, opts);
    const contributions = collectFindingEvidence(dxId, patient, kb, opts);
    const parsimony = parsimonyPenalty(dxId, patient, kb, opts);

    if (parsimony.logLR !== 0) {
      contributions.push({
        source: 'parsimony',
        label: 'Açıklanmayan bulgular',
        logLR: parsimony.logLR,
        unexplained: parsimony.unexplained,
      });
    }

    const logOdds = Math.log(toOdds(prior))
      + contributions.reduce((sum, c) => sum + c.logLR, 0);

    return { id: dxId, label: dx.label, prior, logOdds, contributions, parsimony, dx };
  });

  // --- test sonuclari: sirayla, her biri kendinden onceki dagilimla ---
  let current = normalize(rows);
  for (const { testId, test, resultId } of patient.results) {
    const logLRs = testResultLogLRs(test, resultId, current, kb);
    const resultLabel = test.results.find((r) => r.id === resultId)?.label ?? resultId;
    for (const row of rows) {
      const logLR = logLRs.get(row.id) ?? 0;
      row.logOdds += logLR;
      if (logLR !== 0) {
        row.contributions.push({
          source: 'test',
          code: testId,
          label: `${test.label}: ${resultLabel}`,
          lr: Math.exp(logLR),
          logLR,
        });
      }
    }
    current = normalize(rows);
  }

  const differential = rows
    .map((row) => ({
      id: row.id,
      label: row.label,
      probability: current.get(row.id),
      prior: row.prior,
      severity: row.dx.severity,
      isResidual: Boolean(row.dx.isResidual),
      note: row.dx.note,
      unexplainedFindings: row.parsimony.unexplained,
      contributions: row.contributions
        .slice()
        .sort((a, b) => Math.abs(b.logLR) - Math.abs(a.logLR)),
    }))
    .sort((a, b) => b.probability - a.probability);

  return {
    differential,
    warnings: patient.warnings,
    patient: {
      age: patient.age,
      sex: patient.sex,
      tempo: patient.tempo,
      boxCounts: patient.boxCounts,
    },
    exam: patient.exam,
    entropyBits: entropy(differential.map((d) => d.probability)),
  };
}

/**
 * log-odds -> olasilik, sonra kapali dunyada normalizasyon.
 * Her tani bagimsiz bir ikili hipotez olarak modellenip sonradan
 * normalize edilir; bu bir yaklasimdir, tam bir ortak dagilim degildir.
 * "other_undifferentiated" artik kategorisi kutleyi zorla birkac taniya
 * dagitmayi engeller.
 */
function normalize(rows) {
  const probs = rows.map((r) => fromLogOdds(r.logOdds));
  const total = probs.reduce((a, b) => a + b, 0) || 1;
  const map = new Map();
  rows.forEach((r, i) => map.set(r.id, probs[i] / total));
  return map;
}

export function entropy(probabilities) {
  let h = 0;
  for (const p of probabilities) {
    if (p > 0) h -= p * Math.log2(p);
  }
  return h;
}
