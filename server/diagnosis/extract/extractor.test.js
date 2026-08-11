// FILE: server/diagnosis/extract/extractor.test.js
//
// Cikarim katmani nondeterministiktir; bu testler modelin DOGRU cevap
// verdigini degil, YANLIS cevabinin yakalandigini dogrular. Isabet olcumu
// ayri kosumdadir (eval.js).

import test from 'node:test';
import assert from 'node:assert/strict';

import { extractCase, assembleCase } from './extractor.js';
import { normalizeForMatch, isGrounded, detectLayerLeak } from './verify.js';
import { VIGNETTE_TR } from './fixtures.js';
import { assess } from '../index.js';

const TEXT = VIGNETTE_TR.text;

/** VIGNETTE_TR icin dogru bir model ciktisi (alintilar metinden birebir). */
function goodRaw() {
  return {
    age: 59,
    sex: 'M',
    durationMonths: 24,
    findings: [
      { code: 'fatigue', present: true, box: 'hpi', quote: 'yorgunluk' },
      { code: 'abdominal_pain_upper', present: true, box: 'hpi', quote: 'üst\nkarın ağrısı' },
      { code: 'cognitive_impairment', present: true, box: 'hpi', quote: 'zihinsel bulanıklık' },
      { code: 'constipation', present: true, box: 'hpi', quote: 'kabızlık yakınması eklenmiş' },
      { code: 'nephrolithiasis_history', present: true, box: 'pmh', quote: 'böbrek taşı öyküsü var' },
      {
        code: 'ppi_trial_failed', present: true, box: 'hpi',
        quote: 'rağmen karın ağrısı yalnızca\nara sıra hafiflemiş',
      },
      { code: 'fever', present: false, box: 'hpi', quote: 'Ateş, göğüs ağrısı, kusma ve ishal tariflemiyor' },
      { code: 'chest_pain', present: false, box: 'hpi', quote: 'Ateş, göğüs ağrısı, kusma ve ishal tariflemiyor' },
      { code: 'vomiting', present: false, box: 'hpi', quote: 'Ateş, göğüs ağrısı, kusma ve ishal tariflemiyor' },
      { code: 'diarrhea', present: false, box: 'hpi', quote: 'Ateş, göğüs ağrısı, kusma ve ishal tariflemiyor' },
    ],
    examNormalSystems: [],
    priorDiagnoses: [
      { label: 'Gastroözofageal reflü hastalığı', confirmed: false, quote: 'gastroözofageal\nreflü hastalığı tanısı konmuş' },
    ],
    notes: [],
  };
}

const fakeTransport = (raw) => async () => raw;
const codesIn = (result, box) => result.case[box].map((f) => f.code);

test('uçtan uca: metin → kutulu vaka → yüzde', async () => {
  const result = await extractCase(TEXT, { complete: fakeTransport(goodRaw()) });

  assert.equal(result.case.age, 59);
  assert.equal(result.case.sex, 'M');
  assert.equal(result.case.durationMonths, 24);
  assert.deepEqual(codesIn(result, 'pmh'), ['nephrolithiasis_history']);
  assert.ok(codesIn(result, 'hpi').includes('ppi_trial_failed'));

  // Cikarim ciktisi motora DOGRUDAN girer.
  const r = assess(result.case);
  assert.equal(r.differential[0].id, 'primary_hyperparathyroidism');
  assert.equal(r.nextTests[0].id, 'serum_calcium');
});

test('açık negatifler "yok" olarak taşınır, "sorulmamış" olarak değil', async () => {
  const result = await extractCase(TEXT, { complete: fakeTransport(goodRaw()) });
  const hpi = new Map(result.case.hpi.map((f) => [f.code, f.present]));

  for (const code of ['fever', 'chest_pain', 'vomiting', 'diarrhea']) {
    assert.equal(hpi.get(code), false, `${code} negatif olarak taşınmadı`);
  }
  assert.equal(result.stats.negatives, 4);
});

test('sözlükte olmayan kod atılır', () => {
  const raw = goodRaw();
  raw.findings.push({ code: 'kafa_karisikligi', present: true, box: 'hpi', quote: 'yorgunluk' });

  const result = assembleCase(TEXT, raw);
  assert.ok(result.warnings.some((w) => w.includes('Sözlükte olmayan kod')));
  assert.equal(result.stats.unknownCode, 1);
  assert.ok(!codesIn(result, 'hpi').includes('kafa_karisikligi'));
});

test('metinde geçmeyen alıntı bulguyu düşürür', () => {
  const raw = goodRaw();
  raw.findings.push({
    code: 'weight_loss', present: true, box: 'hpi',
    quote: 'son altı ayda 8 kilo verdiği öğrenildi',
  });

  const result = assembleCase(TEXT, raw);
  assert.ok(!codesIn(result, 'hpi').includes('weight_loss'), 'temellendirilmemiş bulgu geçti');
  assert.equal(result.stats.ungrounded, 1);
  assert.ok(result.warnings.some((w) => w.includes('doğrulanamayan bulgu')));
});

test('flag modunda düşürülmez ama işaretlenir', () => {
  const raw = goodRaw();
  raw.findings.push({ code: 'melena', present: true, box: 'hpi', quote: 'siyah dışkılama' });

  const result = assembleCase(TEXT, raw, { onUngrounded: 'flag' });
  const melena = result.case.hpi.find((f) => f.code === 'melena');
  assert.ok(melena);
  assert.equal(melena.grounded, false);
});

test('kutuyu model değil bilgi tabanı belirler', () => {
  const raw = goodRaw();
  // Model bobrek tasi oykusunu yanlislikla hikayeye koymus.
  raw.findings.find((f) => f.code === 'nephrolithiasis_history').box = 'hpi';

  const result = assembleCase(TEXT, raw);
  assert.deepEqual(codesIn(result, 'pmh'), ['nephrolithiasis_history']);
  assert.ok(!codesIn(result, 'hpi').includes('nephrolithiasis_history'));
  assert.ok(result.warnings.some((w) => w.includes('kutusu düzeltildi')));
});

test('aynı kod hem var hem yok kodlanırsa ilki korunur ve uyarılır', () => {
  const raw = goodRaw();
  raw.findings.push({ code: 'fatigue', present: false, box: 'hpi', quote: 'yorgunluk' });

  const result = assembleCase(TEXT, raw);
  assert.equal(result.case.hpi.filter((f) => f.code === 'fatigue').length, 1);
  assert.equal(result.case.hpi.find((f) => f.code === 'fatigue').present, true);
  assert.ok(result.warnings.some((w) => w.includes('hem var hem yok')));
});

test('present boolean değilse bulgu atılır', () => {
  const raw = goodRaw();
  raw.findings.push({ code: 'bloating', present: 'evet', box: 'hpi', quote: 'yorgunluk' });

  const result = assembleCase(TEXT, raw);
  assert.ok(!codesIn(result, 'hpi').includes('bloating'));
  assert.ok(result.warnings.some((w) => w.includes('boolean değil')));
});

test('önceki tanı kayda geçer ama bulgu olarak beslenmez', () => {
  const result = assembleCase(TEXT, goodRaw());

  assert.equal(result.case.priorDiagnoses.length, 1);
  assert.match(result.case.priorDiagnoses[0].label, /reflü/i);
  assert.equal(result.case.priorDiagnoses[0].confirmed, false);

  // GERD tanisi konmus olmasi hicbir bulgu uretmemeli.
  const allCodes = ['hpi', 'pmh', 'meds', 'fhx', 'habits'].flatMap((b) => codesIn(result, b));
  assert.ok(!allCodes.includes('heartburn'), 'tanı adından semptom türetilmiş');

  // Ve yuzdeyi degistirmemeli.
  const withPrior = assess(result.case);
  const withoutPrior = assess({ ...result.case, priorDiagnoses: [] });
  assert.equal(
    withPrior.differential[0].probability.toFixed(9),
    withoutPrior.differential[0].probability.toFixed(9),
  );
});

test('muayene sistemi de alıntıyla temellendirilir', () => {
  const raw = goodRaw();
  raw.examNormalSystems = [
    { system: 'neuro', quote: 'Nörolojik muayene normal' }, // metinde YOK
  ];

  const result = assembleCase(TEXT, raw);
  assert.deepEqual(result.case.exam.normalSystems, [], 'uydurulan muayene geçti');
  assert.ok(result.warnings.some((w) => w.includes('doğrulanamayan muayene sistemi')));
});

test('sistem normal denip aynı sistemde bulgu kodlanmışsa uyarır', () => {
  const text = 'Batın muayenesi doğal. Epigastrik hassasiyet mevcut.';
  const raw = {
    findings: [{
      code: 'epigastric_tenderness', present: true, box: 'exam',
      quote: 'Epigastrik hassasiyet mevcut',
    }],
    examNormalSystems: [{ system: 'abdomen', quote: 'Batın muayenesi doğal' }],
  };

  const result = assembleCase(text, raw);
  assert.ok(result.warnings.some((w) => w.includes('normal denmiş ama')));
});

test('çıkarım katmanı olasılık üretirse not düşürülür', () => {
  const raw = goodRaw();
  raw.notes = [
    'Hiperparatiroidi olasılığı: %70',
    'Hasta emekli öğretmen olduğunu belirtti',
  ];

  const result = assembleCase(TEXT, raw);
  assert.equal(result.notes.length, 1);
  assert.match(result.notes[0], /öğretmen/);
  assert.ok(result.warnings.some((w) => w.includes('sınırını aştı')));
});

test('kodlanamayan ifadeler not olarak geri bildirilir', () => {
  const raw = goodRaw();
  raw.notes = ['Hasta son dönemde el titremesi tarifliyor — sözlükte karşılığı yok'];

  const result = assembleCase(TEXT, raw);
  assert.equal(result.notes.length, 1);
});

test('eksik demografi uyarı üretir ama akış durmaz', () => {
  const raw = goodRaw();
  raw.age = null;
  raw.sex = null;
  raw.durationMonths = null;

  const result = assembleCase(TEXT, raw);
  assert.ok(result.warnings.some((w) => w.includes('Yaş çıkarılamadı')));
  assert.ok(result.warnings.some((w) => w.includes('Süre çıkarılamadı')));
  assert.equal(assess(result.case).patient.tempo, 'subacute');
});

test('geçersiz girdi ve yanıt reddedilir', async () => {
  await assert.rejects(() => extractCase('', { complete: fakeTransport(goodRaw()) }), /boş/);
  await assert.rejects(() => extractCase(TEXT, {}), /complete/);
  await assert.rejects(
    () => extractCase('x'.repeat(20001), { complete: fakeTransport(goodRaw()) }),
    /çok uzun/,
  );
  assert.throws(() => assembleCase(TEXT, null), /geçersiz yanıt/);
});

test('modele gönderilen istek kapalı sözlüğü taşır', async () => {
  let seen = null;
  await extractCase(TEXT, {
    complete: async (req) => { seen = req; return goodRaw(); },
  });

  assert.ok(seen.system.includes('nephrolithiasis_history'));
  assert.ok(seen.system.includes('Tanı koymazsın, olasılık vermezsin'));
  assert.ok(seen.user.includes(TEXT));
  const codeEnum = seen.schema.properties.findings.items.properties.code.enum;
  assert.ok(codeEnum.includes('thiazide_use'));
  assert.ok(!codeEnum.includes('primary_hyperparathyroidism'), 'tanı kodu sözlüğe sızmış');
});

test('alıntı eşleştirme Türkçe ve noktalamaya dayanıklı', () => {
  assert.equal(normalizeForMatch('  Ateş,   göğüs  ağrısı! '), 'ateş göğüs ağrısı');
  assert.ok(isGrounded('Hasta ateş tariflemiyor.', 'ateş tariflemiyor'));
  assert.ok(isGrounded('üst\nkarın ağrısı', 'üst karın ağrısı'));
  assert.ok(isGrounded('ATEŞ YOK', 'ateş yok'));
  assert.ok(!isGrounded('Hasta ateş tariflemiyor.', 'kilo kaybı'));
  // Cok kisa alinti temellendirme sayilmaz.
  assert.ok(!isGrounded('Hasta ateş tariflemiyor.', 'a'));
});

test('sızıntı dedektörü yanlış alarm vermez', () => {
  const { clean, warnings } = detectLayerLeak([
    'Hasta 2 yıldır şikâyetçi',
    'Kreatinin değeri bildirilmemiş',
  ]);
  assert.equal(warnings.length, 0);
  assert.equal(clean.length, 2);
});
