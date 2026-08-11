// FILE: server/diagnosis/intake.test.js
//
// Kutulu girdi + risk/belirti ekseni + muayenede anlamli negatif.

import test from 'node:test';
import assert from 'node:assert/strict';

import { intake, unexaminedSystems, BOX_IDS } from './intake.js';
import { diagnose } from './engine.js';
import { assess } from './index.js';
import { VIGNETTE_59M_FATIGUE, VIGNETTE_59M_FATIGUE_FULL } from './cases/vignette59mFatigue.js';

const probOf = (r, id) => r.differential.find((d) => d.id === id)?.probability ?? 0;
const entryOf = (r, id) => r.differential.find((d) => d.id === id);

test('her kutu ayrı kaynak izi taşır', () => {
  const { entries, boxCounts } = intake({
    hpi: [{ code: 'fatigue', present: true }],
    pmh: [{ code: 'nephrolithiasis_history', present: true }],
    meds: [{ code: 'thiazide_use', present: true }],
    fhx: [{ code: 'family_history_men1', present: true }],
    habits: [{ code: 'smoking', present: true }],
    exam: { findings: [{ code: 'pallor', present: true }] },
  });

  assert.equal(entries.get('fatigue').box, 'hpi');
  assert.equal(entries.get('nephrolithiasis_history').box, 'pmh');
  assert.equal(entries.get('thiazide_use').box, 'meds');
  assert.equal(entries.get('family_history_men1').box, 'fhx');
  assert.equal(entries.get('smoking').box, 'habits');
  assert.equal(entries.get('pallor').box, 'exam');
  for (const box of BOX_IDS) assert.equal(boxCounts[box], 1);
});

test('düz findings dizisi hâlâ çalışır ve kutusunu kendisi bulur', () => {
  const { entries } = intake({
    findings: [
      { code: 'fatigue', present: true },
      { code: 'family_history_celiac', present: true },
    ],
  });
  assert.equal(entries.get('fatigue').box, 'hpi');
  assert.equal(entries.get('family_history_celiac').box, 'fhx');
});

test('"sistem normal" o sistemin tüm bulgularını YOK yapar', () => {
  const { entries, exam } = intake({ exam: { normalSystems: ['neuro'] } });

  assert.ok(exam.inferredNegatives > 0);
  for (const code of ['reduced_vibration_sense', 'absent_ankle_reflex', 'wrist_drop', 'gait_ataxia']) {
    assert.equal(entries.get(code).present, false, `${code} yok sayılmadı`);
    assert.equal(entries.get(code).inferred, true);
  }
  // Baska sistemler etkilenmemeli: muayene edilmemis sistem BILINMIYOR kalir.
  assert.equal(entries.has('epigastric_tenderness'), false);
  assert.equal(entries.has('goiter'), false);
});

test('açıkça yazılan bulgu, sistem özetinin çıkardığı negatifi ezer', () => {
  const { entries, warnings } = intake({
    exam: {
      normalSystems: ['neuro'],
      findings: [{ code: 'wrist_drop', present: true }],
    },
  });
  assert.equal(entries.get('wrist_drop').present, true);
  assert.equal(entries.get('wrist_drop').inferred, false);
  assert.equal(entries.get('absent_ankle_reflex').present, false);
  assert.equal(warnings.length, 0, 'gereksiz çelişki uyarısı');
});

test('bilinmeyen muayene sistemi uyarı üretir', () => {
  const { warnings } = intake({ exam: { normalSystems: ['kuyruk'] } });
  assert.ok(warnings.some((w) => w.includes('muayene sistemi')));
});

test('uyarı hangi kutudan geldiğini söyler', () => {
  const { warnings } = intake({ fhx: [{ code: 'uydurma', present: true }] });
  assert.ok(warnings[0].includes('Soygeçmiş'), warnings[0]);
});

test('normal nörolojik muayene B12 eksikliğini düşürür', () => {
  // Anlamli negatifin tum degeri burada: muayene YAPILMADIYSA dusmemeli.
  const notExamined = diagnose({
    age: 60, sex: 'M', durationMonths: 18,
    hpi: [{ code: 'fatigue', present: true }, { code: 'cognitive_impairment', present: true }],
  });
  const examinedNormal = diagnose({
    age: 60, sex: 'M', durationMonths: 18,
    hpi: [{ code: 'fatigue', present: true }, { code: 'cognitive_impairment', present: true }],
    exam: { normalSystems: ['neuro'] },
  });
  assert.ok(
    probOf(examinedNormal, 'b12_deficiency') < probOf(notExamined, 'b12_deficiency'),
    'normal muayene B12 olasılığını düşürmedi',
  );
});

test('RİSK FAKTÖRÜ tekillik cezasına girmez', () => {
  // Kusur: hiperparatiroidi, hastanin MESLEGINI aciklamadigi icin ceza
  // yiyordu. Risk bir belirti degildir; aciklanmasi beklenemez.
  const withExposure = diagnose({
    ...VIGNETTE_59M_FATIGUE,
    habits: [{ code: 'occupational_lead_exposure', present: true }],
  });

  const phpt = entryOf(withExposure, 'primary_hyperparathyroidism');
  assert.ok(
    !phpt.unexplainedFindings.some((u) => u.code === 'occupational_lead_exposure'),
    'risk faktörü "açıklanmayan bulgu" sayılmış',
  );
  // Maruziyet kursun toksisitesini yine de yukseltmelidir.
  assert.ok(
    probOf(withExposure, 'lead_toxicity') > probOf(diagnose(VIGNETTE_59M_FATIGUE), 'lead_toxicity') * 5,
  );
});

test('risk faktörü olasılığı yükseltir ama listeyi çarpıtmaz', () => {
  const base = diagnose(VIGNETTE_59M_FATIGUE);
  const withMen1 = diagnose({
    ...VIGNETTE_59M_FATIGUE,
    fhx: [{ code: 'family_history_men1', present: true }],
  });

  assert.ok(
    probOf(withMen1, 'primary_hyperparathyroidism') > probOf(base, 'primary_hyperparathyroidism'),
    'soygeçmiş ön-testi yükseltmedi',
  );
  // Belirtileri aciklayan tanilar, aciklamayan tanilara gore konumunu korumali.
  const phpt = entryOf(withMen1, 'primary_hyperparathyroidism');
  assert.equal(phpt.unexplainedFindings.length, 0);
});

test('belirti sayılan özgeçmiş maddesi cezaya girmeye devam eder', () => {
  // Bobrek tasi oykusu risk degil, belirtidir: uyku apnesi onu aciklamiyorsa
  // ceza almalidir.
  const r = diagnose(VIGNETTE_59M_FATIGUE);
  const osa = entryOf(r, 'obstructive_sleep_apnea');
  assert.ok(osa.unexplainedFindings.some((u) => u.code === 'nephrolithiasis_history'));
  assert.equal(
    osa.unexplainedFindings.find((u) => u.code === 'nephrolithiasis_history').box,
    'pmh',
  );
});

test('gerekçe satırı kaynağını ve çıkarım olup olmadığını taşır', () => {
  const r = diagnose(VIGNETTE_59M_FATIGUE_FULL);
  const phpt = entryOf(r, 'primary_hyperparathyroidism');

  const thiazide = phpt.contributions.find((c) => c.code === 'thiazide_use');
  assert.equal(thiazide.boxLabel, 'İlaçlar');
  assert.equal(thiazide.axis, 'risk');

  const stone = phpt.contributions.find((c) => c.code === 'nephrolithiasis_history');
  assert.equal(stone.boxLabel, 'Özgeçmiş');
  assert.equal(stone.axis, 'manifestation');

  // Cikarilmis negatif, yalnizca LR-'si 1'den farkli olan tanida katki uretir.
  // Hiperparatiroidi icin norolojik muayenenin normal olmasi bilgi tasimaz;
  // B12 eksikligi icin tasir.
  assert.equal(phpt.contributions.filter((c) => c.inferred).length, 0);

  const b12 = entryOf(r, 'b12_deficiency');
  const inferredRows = b12.contributions.filter((c) => c.inferred);
  assert.ok(inferredRows.length > 0, 'muayeneden çıkarılan negatif gerekçede görünmüyor');
  assert.ok(inferredRows.every((c) => c.logLR < 0), 'normal muayene B12 lehine sayılmış');
});

test('dolu kutular listeyi keskinleştirir', () => {
  const sparse = diagnose(VIGNETTE_59M_FATIGUE);
  const full = diagnose(VIGNETTE_59M_FATIGUE_FULL);

  assert.equal(full.differential[0].id, 'primary_hyperparathyroidism');
  assert.ok(full.entropyBits < sparse.entropyBits, 'ek kutular belirsizliği azaltmadı');
  // Normal norolojik muayene + tiyazid: B12 duser, hiperparatiroidi yukselir.
  assert.ok(probOf(full, 'b12_deficiency') < probOf(sparse, 'b12_deficiency'));
  assert.ok(
    probOf(full, 'primary_hyperparathyroidism') > probOf(sparse, 'primary_hyperparathyroidism'),
  );
});

test('eksik muayene sistemleri önerilir, yapılanlar önerilmez', () => {
  const sparse = assess(VIGNETTE_59M_FATIGUE);
  assert.ok(sparse.missingExam.length > 0, 'hiç muayene önerisi yok');

  const full = assess(VIGNETTE_59M_FATIGUE_FULL);
  const suggested = full.missingExam.map((m) => m.system);
  for (const done of ['abdomen', 'neuro', 'skin', 'neck']) {
    assert.ok(!suggested.includes(done), `${done} zaten muayene edilmiş, yine önerilmiş`);
  }
});

test('boş kutu "hepsi normal" demek değildir', () => {
  const empty = diagnose({ ...VIGNETTE_59M_FATIGUE, exam: {} });
  const normal = diagnose({
    ...VIGNETTE_59M_FATIGUE,
    exam: { normalSystems: ['abdomen', 'neuro', 'skin', 'neck', 'general', 'cardiovascular'] },
  });
  assert.notEqual(
    probOf(empty, 'b12_deficiency').toFixed(6),
    probOf(normal, 'b12_deficiency').toFixed(6),
  );
});
