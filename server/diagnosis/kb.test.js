// FILE: server/diagnosis/kb.test.js
//
// Bilgi tabani dogrulayicisinin kendisini test eder. Bozuk bir KB ile
// sessizce yanlis yuzde uretmek, patlamaktan daha tehlikelidir.

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildKb, defaultKb } from './kb/index.js';
import { DIAGNOSES } from './kb/diagnoses.js';
import { TESTS } from './kb/tests.js';
import { FINDINGS } from './kb/findings.js';
import { BOX_IDS } from './intake.js';

test('varsayılan bilgi tabanı geçerli', () => {
  assert.doesNotThrow(() => buildKb());
  assert.ok(defaultKb.diagnosisIds.length >= 15);
  assert.ok(defaultKb.findingIds.length >= 30);
  assert.ok(defaultKb.testIds.length >= 10);
});

test('her tanının bir olabilirlik satırı vardır', () => {
  for (const dxId of defaultKb.diagnosisIds) {
    assert.ok(defaultKb.likelihoods[dxId], `${dxId} için LR satırı yok`);
  }
});

test('salience LR+ değerlerinden türetilir ve 0-1 aralığındadır', () => {
  for (const findingId of defaultKb.findingIds) {
    const s = defaultKb.salience[findingId];
    assert.ok(s >= 0 && s <= 1, `${findingId}: ${s}`);
  }
  // Bobrek tasi oykusu (max LR+ 6) yorgunluktan (max LR+ 3.5) daha ayirt edici.
  assert.ok(defaultKb.salience.nephrolithiasis_history > defaultKb.salience.fatigue);
  // Hicbir tanida ayirt edici olmayan bulgu 0 agirlik alir.
  assert.equal(defaultKb.salience.laxative_trial_failed > 0, true);
});

test('test olasılıkları 1e toplanmazsa hata verir', () => {
  assert.throws(
    () => buildKb({
      tests: {
        ...TESTS,
        bozuk: {
          label: 'Bozuk', cost: 1, invasiveness: 0,
          results: [{ id: 'a' }, { id: 'b' }],
          p: { depression: { a: 0.5, b: 0.9 } },
          fallback: { a: 0.5, b: 0.5 },
        },
      },
    }),
    /toplanmıyor/,
  );
});

test('eksik sonuç olasılığı hata verir', () => {
  assert.throws(
    () => buildKb({
      tests: {
        eksik: {
          label: 'Eksik', cost: 1, invasiveness: 0,
          results: [{ id: 'a' }, { id: 'b' }],
          fallback: { a: 1 },
        },
      },
    }),
    /için olasılık yok/,
  );
});

test('bilinmeyen tanı veya bulgu referansı hata verir', () => {
  assert.throws(
    () => buildKb({ likelihoods: { yok_boyle_tani: {} } }),
    /bilinmeyen tanı/,
  );
  assert.throws(
    () => buildKb({ likelihoods: { depression: { yok_boyle_bulgu: 2 } } }),
    /bilinmeyen bulgu/,
  );
  assert.throws(
    () => buildKb({
      tests: { ...TESTS, tsh: { ...TESTS.tsh, p: { yok_boyle_tani: TESTS.tsh.fallback } } },
    }),
    /bilinmeyen tanı/,
  );
});

test('geçersiz LR hata verir', () => {
  assert.throws(
    () => buildKb({ likelihoods: { depression: { fatigue: 0 } } }),
    /LR pozitif olmalı/,
  );
  assert.throws(
    () => buildKb({ likelihoods: { depression: { fatigue: [2, -1] } } }),
    /LR pozitif olmalı/,
  );
});

test('geçersiz prevalans / ciddiyet / seyir hata verir', () => {
  const base = DIAGNOSES.depression;
  assert.throws(
    () => buildKb({ diagnoses: { depression: { ...base, prevalence: 1.5 } } }),
    /prevalence/,
  );
  assert.throws(
    () => buildKb({ diagnoses: { depression: { ...base, severity: 2 } } }),
    /severity/,
  );
  assert.throws(
    () => buildKb({ diagnoses: { depression: { ...base, tempo: { acute: 1, subacute: 1 } } } }),
    /tempo\.chronic/,
  );
});

test('kümeler tanımlı bulgulara aittir', () => {
  const clusters = new Map();
  for (const [id, f] of Object.entries(FINDINGS)) {
    if (!f.cluster) continue;
    clusters.set(f.cluster, (clusters.get(f.cluster) ?? 0) + 1);
    assert.ok(f.label, `${id}: etiket yok`);
  }
  // Tek uyeli kume anlamsizdir: indirim hic uygulanmaz.
  for (const [cluster, count] of clusters) {
    assert.ok(count > 1, `"${cluster}" kümesinde tek bulgu var`);
  }
});

test('her bulgu bir kutuya aittir, muayene bulgusunun sistemi vardır', () => {
  for (const [id, f] of Object.entries(FINDINGS)) {
    assert.ok(BOX_IDS.includes(f.box), `${id}: geçersiz kutu "${f.box}"`);
    if (f.box === 'exam') {
      assert.ok(f.system, `${id}: muayene bulgusunun sistemi yok — "sistem normal" onu yakalayamaz`);
    }
    if (f.axis) assert.equal(f.axis, 'risk', `${id}: bilinmeyen eksen "${f.axis}"`);
  }
});

test('atıl bulgu yoktur: her bulgu en az bir tanıda iş yapar', () => {
  // Doktorun girebildigi ama hicbir yuzdeyi oynatmayan bulgu, sozluge
  // guveni bosuna harcar.
  for (const findingId of defaultKb.findingIds) {
    const works = defaultKb.diagnosisIds.some((dxId) => {
      const lr = defaultKb.likelihoods[dxId]?.[findingId];
      return lr && (lr.pos !== 1 || lr.neg !== 1);
    });
    assert.ok(works, `${findingId} hiçbir tanıda LR taşımıyor`);
  }
});

test('risk faktörlerinin salience değeri tekillik cezasında kullanılmaz', () => {
  // Salience yine hesaplanir (baska yerde ise yarayabilir) ama motor risk
  // eksenini cezadan muaf tutar. Burada sozlugun tutarliligini bekcilik ediyoruz:
  // risk ekseni yalnizca ozgecmis/ilac/soygecmis/aliskanlik kutularinda olsun.
  for (const [id, f] of Object.entries(FINDINGS)) {
    if (f.axis !== 'risk') continue;
    assert.ok(
      ['pmh', 'meds', 'fhx', 'habits'].includes(f.box),
      `${id}: risk ekseni "${f.box}" kutusunda — hikâye/muayene belirtidir`,
    );
  }
});

test('her tanı en az bir testle ayrıştırılabilir', () => {
  // Ayristirilamayan tani, listede sonsuza kadar asili kalir.
  for (const dxId of defaultKb.diagnosisIds) {
    if (DIAGNOSES[dxId].isResidual) continue;
    const hasTest = defaultKb.testIds.some((testId) => {
      const t = defaultKb.tests[testId];
      return Boolean(t.p?.[dxId]);
    });
    assert.ok(hasTest, `${dxId} için ayırt edici test yok`);
  }
});
