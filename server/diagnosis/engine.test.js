// FILE: server/diagnosis/engine.test.js
// node --test diagnosis/

import test from 'node:test';
import assert from 'node:assert/strict';

import { diagnose, tempoBucket, normalizeSex, DEFAULTS } from './engine.js';
import { VIGNETTE_59M_FATIGUE } from './cases/vignette59mFatigue.js';

const probOf = (result, id) => result.differential.find((d) => d.id === id)?.probability ?? 0;
const rankOf = (result, id) => result.differential.findIndex((d) => d.id === id);

test('vaka: hiperparatiroidi ilk sırada ve ikinciyle arasında net fark var', () => {
  const r = diagnose(VIGNETTE_59M_FATIGUE);
  const [first, second] = r.differential;

  assert.equal(first.id, 'primary_hyperparathyroidism', `beklenen 1. sıra değil: ${first.id}`);
  assert.ok(
    first.probability > second.probability * 1.8,
    `1. sıra farkı yetersiz: ${first.probability.toFixed(3)} vs ${second.probability.toFixed(3)}`,
  );
  // Motor asla "kesin" dememeli: yalnizca oyku ile %50'yi asmak kalibrasyon
  // bozuklugunun isaretidir.
  assert.ok(first.probability < 0.5, 'yalnızca öykü ile aşırı güven');
});

test('olasılıklar 1e toplanır ve hiçbiri negatif değildir', () => {
  const r = diagnose(VIGNETTE_59M_FATIGUE);
  const total = r.differential.reduce((s, d) => s + d.probability, 0);
  assert.ok(Math.abs(total - 1) < 1e-9, `toplam ${total}`);
  assert.ok(r.differential.every((d) => d.probability >= 0));
});

test('"yok" ile "sorulmamış" farklı sonuç verir', () => {
  const withNegatives = diagnose(VIGNETTE_59M_FATIGUE);
  const withoutNegatives = diagnose({
    ...VIGNETTE_59M_FATIGUE,
    hpi: VIGNETTE_59M_FATIGUE.hpi.filter((f) => f.present),
  });
  assert.notEqual(
    probOf(withNegatives, 'primary_hyperparathyroidism'),
    probOf(withoutNegatives, 'primary_hyperparathyroidism'),
  );

  // Yokluğun güçlü ayırt edici olduğu yer: kognitif bulgu yoksa nörodejeneratif
  // hastalık düşer; sorulmamışsa düşmez.
  const base = { age: 70, sex: 'F', durationMonths: 24, findings: [{ code: 'fatigue', present: true }] };
  const absent = diagnose({ ...base, findings: [...base.findings, { code: 'cognitive_impairment', present: false }] });
  const unknown = diagnose(base);
  assert.ok(
    probOf(absent, 'neurodegenerative_disorder') < probOf(unknown, 'neurodegenerative_disorder') * 0.5,
    'negatif bulgu LR- uygulanmamış',
  );
});

test('tedaviye yanıtsızlık GERD\'i dışlar', () => {
  const withoutTrial = diagnose({
    ...VIGNETTE_59M_FATIGUE,
    hpi: VIGNETTE_59M_FATIGUE.hpi.filter((f) => f.code !== 'ppi_trial_failed'),
  });
  const withTrial = diagnose(VIGNETTE_59M_FATIGUE);

  assert.ok(
    probOf(withTrial, 'gerd') < probOf(withoutTrial, 'gerd') * 0.5,
    'PPI yanıtsızlığı GERD olasılığını yeterince düşürmedi',
  );
  // Metinde konmus GERD tanisi kanit degildir: ilk 5'te olmamali.
  assert.ok(rankOf(withTrial, 'gerd') > 4, 'doğrulanmamış ön tanı listeye kilitlenmiş');
});

test('önceki (doğrulanmamış) tanı bir kanıt olarak beslenmez', () => {
  const withPrior = diagnose(VIGNETTE_59M_FATIGUE);
  const withoutPrior = diagnose({ ...VIGNETTE_59M_FATIGUE, priorDiagnoses: undefined });
  assert.deepEqual(
    withPrior.differential.map((d) => [d.id, d.probability.toFixed(9)]),
    withoutPrior.differential.map((d) => [d.id, d.probability.toFixed(9)]),
  );
});

test('tekillik cezası olmadan liste dağılır', () => {
  const withParsimony = diagnose(VIGNETTE_59M_FATIGUE);
  const without = diagnose(VIGNETTE_59M_FATIGUE, { parsimonyWeight: 0 });

  const lead = (r) => r.differential[0].probability / r.differential[1].probability;
  assert.ok(
    lead(withParsimony) > lead(without),
    'tekillik cezası 1. sıranın önünü açmıyor',
  );

  // Yalnizca yorgunluk + kognitif aciklayan bir tani ceza almalidir.
  const osa = 'obstructive_sleep_apnea';
  assert.ok(probOf(withParsimony, osa) < probOf(without, osa), 'ceza uygulanmamış');

  const entry = withParsimony.differential.find((d) => d.id === osa);
  const unexplained = entry.unexplainedFindings.map((u) => u.code);
  assert.ok(unexplained.includes('nephrolithiasis_history'));
  assert.ok(unexplained.includes('constipation'));
});

test('artık kategori tekillik cezası almaz', () => {
  const r = diagnose(VIGNETTE_59M_FATIGUE);
  const residual = r.differential.find((d) => d.isResidual);
  assert.equal(residual.unexplainedFindings.length, 0);
  assert.ok(residual.probability > 0.02, 'artık kategori kütlesi yok olmuş');
});

test('korele bulgular kümede indirimli sayılır', () => {
  const one = diagnose({
    age: 50, sex: 'M', durationMonths: 12,
    findings: [{ code: 'abdominal_pain_upper', present: true }],
  });
  const two = diagnose({
    age: 50, sex: 'M', durationMonths: 12,
    findings: [
      { code: 'abdominal_pain_upper', present: true },
      { code: 'heartburn', present: true },
    ],
  });

  const entry = two.differential.find((d) => d.id === 'gerd');
  const discounted = entry.contributions.filter((c) => c.discounted);
  assert.equal(discounted.length, 1, 'küme indirimi uygulanmamış');
  assert.equal(discounted[0].code, 'abdominal_pain_upper', 'indirim yanlış bulguya uygulanmış');

  // Iki bulgu tek bulgudan daha guclu olmali, ama carpimlarinin tamami kadar degil.
  const oddsOf = (r) => { const p = probOf(r, 'gerd'); return p / (1 - p); };
  const ratio = oddsOf(two) / oddsOf(one);
  assert.ok(ratio > 1, 'ikinci bulgu kanıt eklemiyor');
  assert.ok(ratio < 6.0, `küme indirimi çalışmıyor (oran ${ratio.toFixed(2)}, ham LR 6.0)`);
});

test('seyir süresi ayrı bir eksendir', () => {
  const chronic = diagnose({ ...VIGNETTE_59M_FATIGUE, durationMonths: 24 });
  const acute = diagnose({ ...VIGNETTE_59M_FATIGUE, durationMonths: 0.5 });

  assert.equal(chronic.patient.tempo, 'chronic');
  assert.equal(acute.patient.tempo, 'acute');
  // 2 yillik sinsi seyir maligniteyi asagi, kronik metaboliki yukari iter.
  assert.ok(
    probOf(chronic, 'hypercalcemia_of_malignancy') < probOf(acute, 'hypercalcemia_of_malignancy'),
  );
});

test('demografi ön-testi değiştirir', () => {
  const male = diagnose(VIGNETTE_59M_FATIGUE);
  const female = diagnose({ ...VIGNETTE_59M_FATIGUE, sex: 'F' });
  assert.ok(
    probOf(female, 'primary_hyperparathyroidism') > probOf(male, 'primary_hyperparathyroidism'),
    'cinsiyet çarpanı uygulanmamış',
  );

  const young = diagnose({ ...VIGNETTE_59M_FATIGUE, age: 30 });
  assert.ok(probOf(young, 'gi_malignancy') < probOf(male, 'gi_malignancy'));
});

test('bileşik demografi çarpanı sınırlanır', () => {
  // Yas x cinsiyet x seyir carpanlari carpilinca on-test sisiyordu.
  const r = diagnose(VIGNETTE_59M_FATIGUE);
  for (const d of r.differential) {
    assert.ok(
      d.prior <= 0.22 * DEFAULTS.modifierClamp[1] + 1e-9,
      `${d.id} ön-testi sınırın üstünde: ${d.prior}`,
    );
  }
});

test('test sonucu yüzdeyi doğru yönde günceller', () => {
  const base = diagnose(VIGNETTE_59M_FATIGUE);
  const high = diagnose({
    ...VIGNETTE_59M_FATIGUE,
    testResults: [{ test: 'serum_calcium', result: 'high' }],
  });
  const normal = diagnose({
    ...VIGNETTE_59M_FATIGUE,
    testResults: [{ test: 'serum_calcium', result: 'normal' }],
  });

  const phpt = 'primary_hyperparathyroidism';
  assert.ok(probOf(high, phpt) > 0.6, `kalsiyum yüksek sonrası düşük: ${probOf(high, phpt)}`);
  assert.ok(probOf(normal, phpt) < probOf(base, phpt) * 0.35, 'negatif sonuç yeterince düşürmüyor');
  assert.ok(high.entropyBits < base.entropyBits, 'test belirsizliği azaltmadı');
});

test('kalsiyum normalse hiperparatiroidi ilk sıradan düşer (negatif kontrol)', () => {
  const r = diagnose({
    ...VIGNETTE_59M_FATIGUE,
    testResults: [{ test: 'serum_calcium', result: 'normal' }],
  });
  assert.notEqual(r.differential[0].id, 'primary_hyperparathyroidism');
  assert.ok(rankOf(r, 'primary_hyperparathyroidism') > 4);
});

test('ardışık testler birikimli kanıt üretir', () => {
  const ca = diagnose({
    ...VIGNETTE_59M_FATIGUE,
    testResults: [{ test: 'serum_calcium', result: 'high' }],
  });
  const caPth = diagnose({
    ...VIGNETTE_59M_FATIGUE,
    testResults: [
      { test: 'serum_calcium', result: 'high' },
      { test: 'pth', result: 'high_or_inappropriate' },
    ],
  });
  const phpt = 'primary_hyperparathyroidism';
  assert.ok(probOf(caPth, phpt) > probOf(ca, phpt));
  assert.ok(probOf(caPth, phpt) > 0.9);

  // PTH baskiliysa tani malignite tarafina kaymalidir.
  const suppressed = diagnose({
    ...VIGNETTE_59M_FATIGUE,
    testResults: [
      { test: 'serum_calcium', result: 'high' },
      { test: 'pth', result: 'suppressed' },
    ],
  });
  assert.equal(suppressed.differential[0].id, 'hypercalcemia_of_malignancy');
});

test('gerekçe izlenebilir: her katkı bir kaynağa bağlı', () => {
  const r = diagnose({
    ...VIGNETTE_59M_FATIGUE,
    testResults: [{ test: 'serum_calcium', result: 'high' }],
  });
  const top = r.differential[0];
  const sources = new Set(top.contributions.map((c) => c.source));
  assert.ok(sources.has('finding'));
  assert.ok(sources.has('test'));
  // Katkilar mutlak etkiye gore sirali olmali.
  const magnitudes = top.contributions.map((c) => Math.abs(c.logLR));
  assert.deepEqual(magnitudes, [...magnitudes].sort((a, b) => b - a));
});

test('bilinmeyen girdi uyarı üretir, çökmez', () => {
  const r = diagnose({
    age: 'kırk',
    sex: 'yes',
    durationMonths: 12,
    findings: [
      { code: 'uydurma_bulgu', present: true },
      { code: 'fatigue', present: true },
    ],
    testResults: [
      { test: 'uydurma_test', result: 'high' },
      { test: 'serum_calcium', result: 'mor' },
    ],
  });
  assert.equal(r.warnings.length, 5, r.warnings.join(' | '));
  assert.equal(r.patient.age, null);
  assert.equal(r.patient.sex, null);
  assert.ok(r.differential.length > 0);
});

test('çelişkili bulgu uyarı üretir', () => {
  const r = diagnose({
    age: 50, sex: 'M', durationMonths: 12,
    findings: [
      { code: 'fatigue', present: true },
      { code: 'fatigue', present: false },
    ],
  });
  assert.ok(r.warnings.some((w) => w.includes('Çelişkili')));
});

test('bulgu yoksa sıralama ön-test olasılıklarını izler', () => {
  const r = diagnose({ age: 59, sex: 'M', durationMonths: 24, findings: [] });
  const priors = r.differential.map((d) => d.prior);
  assert.deepEqual(priors, [...priors].sort((a, b) => b - a));
});

test('yardımcılar', () => {
  assert.equal(tempoBucket(0.5), 'acute');
  assert.equal(tempoBucket(3), 'subacute');
  assert.equal(tempoBucket(24), 'chronic');
  assert.equal(tempoBucket(null), 'subacute');
  assert.equal(normalizeSex('Erkek'), 'M');
  assert.equal(normalizeSex('female'), 'F');
  assert.equal(normalizeSex('kadın'), 'F');
  assert.equal(normalizeSex('?'), null);
});
