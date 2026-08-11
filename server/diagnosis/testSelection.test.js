// FILE: server/diagnosis/testSelection.test.js

import test from 'node:test';
import assert from 'node:assert/strict';

import { diagnose } from './engine.js';
import { recommendTests, bestTestFor } from './testSelection.js';
import { redFlags } from './redFlags.js';
import { VIGNETTE_59M_FATIGUE } from './cases/vignette59mFatigue.js';

const rec = (caseInput, options) =>
  recommendTests(diagnose(caseInput).differential, options);

const find = (recs, id) => recs.find((r) => r.id === id);

test('vaka: en yüksek fayda serum kalsiyumunda', () => {
  const { recommendations } = rec(VIGNETTE_59M_FATIGUE);
  assert.equal(recommendations[0].id, 'serum_calcium', `öneri: ${recommendations[0].id}`);
  assert.ok(recommendations[0].uncertaintyReductionPct > 10);
});

test('bilgi kazancı hiçbir testte negatif olamaz', () => {
  // Beklenen kosullu entropi, kosulsuz entropiyi asamaz. Negatif kazanc
  // hesapta hata demektir.
  const { recommendations } = rec(VIGNETTE_59M_FATIGUE);
  for (const r of recommendations) {
    assert.ok(r.infoGainBits >= -1e-9, `${r.id}: ${r.infoGainBits}`);
  }
});

test('sonuç olasılıkları 1e toplanır', () => {
  const { recommendations } = rec(VIGNETTE_59M_FATIGUE);
  for (const r of recommendations) {
    const total = r.outcomes.reduce((s, o) => s + o.probability, 0);
    assert.ok(Math.abs(total - 1) < 1e-9, `${r.id}: ${total}`);
  }
});

test('özgüllüğü düşük test daha az bilgi taşır', () => {
  // PHQ-9 ile MoCA neredeyse bedava; yine de kalsiyumun altinda kalmalilar,
  // cunku kronik hastaligin cogunda pozitiflesiyorlar.
  const { recommendations } = rec(VIGNETTE_59M_FATIGUE);
  const ca = find(recommendations, 'serum_calcium');
  const phq = find(recommendations, 'phq9');
  const moca = find(recommendations, 'moca');

  assert.ok(ca.infoGainBits > phq.infoGainBits * 2, 'PHQ-9 fazla bilgi taşıyor');
  assert.ok(ca.utility > moca.utility);
});

test('pahalı ve girişimsel test fayda sıralamasında geriler', () => {
  const { recommendations } = rec(VIGNETTE_59M_FATIGUE);
  const colonoscopy = find(recommendations, 'colonoscopy');
  const cbc = find(recommendations, 'cbc');
  assert.ok(cbc.utility > colonoscopy.utility);
  assert.ok(colonoscopy.effectiveCost > cbc.effectiveCost * 3);
});

test('kalsiyum yüksek geldikten sonra sıra PTH\'a geçer', () => {
  const { recommendations } = rec(
    { ...VIGNETTE_59M_FATIGUE, testResults: [{ test: 'serum_calcium', result: 'high' }] },
    { exclude: ['serum_calcium'] },
  );
  assert.equal(recommendations[0].id, 'pth');
});

test('yapılmış test yeniden önerilmez', () => {
  const { recommendations } = rec(VIGNETTE_59M_FATIGUE, { exclude: ['serum_calcium', 'pth'] });
  assert.ok(!find(recommendations, 'serum_calcium'));
  assert.ok(!find(recommendations, 'pth'));
});

test('sonuç önizlemesi hangi tanının öne çıkacağını söyler', () => {
  const { recommendations } = rec(VIGNETTE_59M_FATIGUE);
  const ca = find(recommendations, 'serum_calcium');
  const high = ca.outcomes.find((o) => o.id === 'high');
  const normal = ca.outcomes.find((o) => o.id === 'normal');

  assert.equal(high.topDiagnosis.id, 'primary_hyperparathyroidism');
  assert.notEqual(normal.topDiagnosis.id, 'primary_hyperparathyroidism');
  assert.ok(high.entropyAfter < normal.entropyAfter, 'pozitif sonuç daha çok ayrıştırmalı');
});

test('top parametresi listeyi kısaltır', () => {
  const { recommendations } = rec(VIGNETTE_59M_FATIGUE, { top: 3 });
  assert.equal(recommendations.length, 3);
});

test('bestTestFor: belirli bir tanıyı dışlayacak testi seçer', () => {
  const differential = diagnose(VIGNETTE_59M_FATIGUE).differential;
  assert.equal(bestTestFor('lead_toxicity', differential).id, 'blood_lead_level');
  assert.equal(bestTestFor('celiac_disease', differential).id, 'ttg_iga');
  assert.equal(bestTestFor('adrenal_insufficiency', differential).id, 'am_cortisol');
});

test('kırmızı bayraklar beklenen zarara göre sıralanır, artık kategori girmez', () => {
  const differential = diagnose(VIGNETTE_59M_FATIGUE).differential;
  const flags = redFlags(differential);

  const harms = flags.items.map((f) => f.expectedHarm);
  assert.deepEqual(harms, [...harms].sort((a, b) => b - a));
  assert.ok(!flags.items.some((f) => f.id === 'other_undifferentiated'));
  assert.ok(flags.items.every((f) => f.severity >= 0.6));
  assert.ok(flags.mustExclude.length > 0, 'hiç kırmızı bayrak çıkmadı');
});

test('kalsiyum yüksekken malignite hiperkalsemisi kırmızı bayrağa yükselir', () => {
  // Dusuk olasilik + yuksek ciddiyet: yuzde siralamasinda dipte kalir ama
  // beklenen zarar ekseninde one cikmalidir.
  const differential = diagnose({
    ...VIGNETTE_59M_FATIGUE,
    testResults: [{ test: 'serum_calcium', result: 'high' }],
  }).differential;
  const flags = redFlags(differential, { exclude: ['serum_calcium'] });

  assert.equal(flags.mustExclude[0].id, 'hypercalcemia_of_malignancy');
  assert.equal(flags.mustExclude[0].discriminatingTest.id, 'pth');
});
