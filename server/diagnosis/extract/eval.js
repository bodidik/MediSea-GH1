// FILE: server/diagnosis/extract/eval.js
//
// Cikarim ISABET olcumu. Birim testlerinden ayridir ve npm test'e BAGLI DEGILDIR:
// gercek API cagirir, para harcar, nondeterministiktir.
//
//   node diagnosis/extract/eval.js
//
// Olculen sey "gecti/kaldi" degil, dort ayri hata turu:
//   kacirilan bulgu  (recall)          - motorun goremeyecegi kanit
//   uydurulan bulgu  (false positive)  - motoru yanlis yone iten kanit
//   kutup hatasi     (var/yok ters)    - en tehlikelisi
//   temellendirme    (alinti tutmuyor) - kisit yakaladi mi

import { extractCase } from './extractor.js';
import { createAnthropicTransport, hasApiKey } from './anthropicTransport.js';
import { FIXTURES } from './fixtures.js';
import { assess } from '../index.js';

const PASS_THRESHOLD = { recall: 0.9, falsePositives: 0, polarityErrors: 0 };

function scoreOne(fixture, result) {
  const found = new Map();
  for (const box of ['hpi', 'exam', 'pmh', 'meds', 'fhx', 'habits']) {
    for (const f of result.case[box] ?? []) found.set(f.code, f.present);
  }

  const missed = [];
  const polarityErrors = [];
  for (const want of fixture.expect.mustFind) {
    if (!found.has(want.code)) { missed.push(want.code); continue; }
    if (found.get(want.code) !== want.present) {
      polarityErrors.push(
        `${want.code}: beklenen ${want.present ? 'var' : 'yok'}, çıkan ${found.get(want.code) ? 'var' : 'yok'}`,
      );
    }
  }

  const falsePositives = fixture.expect.mustNotFind.filter((code) => found.has(code));

  const demographics = [];
  const e = fixture.expect;
  if (result.case.age !== e.age) demographics.push(`yaş: ${result.case.age} ≠ ${e.age}`);
  if (result.case.sex !== e.sex) demographics.push(`cinsiyet: ${result.case.sex} ≠ ${e.sex}`);
  if (e.durationMonthsRange) {
    const d = result.case.durationMonths;
    const [lo, hi] = e.durationMonthsRange;
    if (!(d >= lo && d <= hi)) demographics.push(`süre: ${d} ∉ [${lo}, ${hi}]`);
  }

  const gotSystems = [...result.case.exam.normalSystems].sort();
  const wantSystems = [...e.examNormalSystems].sort();
  const examOk = JSON.stringify(gotSystems) === JSON.stringify(wantSystems);

  let priorOk = true;
  if (e.mustPriorDiagnosis) {
    priorOk = result.case.priorDiagnoses.some((d) => e.mustPriorDiagnosis.test(d.label));
  }

  return {
    recall: (e.mustFind.length - missed.length) / e.mustFind.length,
    missed,
    polarityErrors,
    falsePositives,
    demographics,
    examOk,
    gotSystems,
    wantSystems,
    priorOk,
    stats: result.stats,
    warnings: result.warnings,
  };
}

function printScore(fixture, s, result) {
  const pct = (x) => `${(x * 100).toFixed(0)}%`;
  const ok = (b) => (b ? '✓' : '✗');

  console.log(`\n${'─'.repeat(70)}\n${fixture.id}\n${'─'.repeat(70)}`);
  console.log(`  Önerilen ${s.stats.proposed}, kabul ${s.stats.accepted}`
    + `  (sözlük dışı ${s.stats.unknownCode}, temellendirilemeyen ${s.stats.ungrounded})`);
  console.log(`  ${ok(s.recall >= PASS_THRESHOLD.recall)} recall ${pct(s.recall)}`
    + (s.missed.length ? `  kaçırılan: ${s.missed.join(', ')}` : ''));
  console.log(`  ${ok(!s.falsePositives.length)} uydurulan bulgu: ${s.falsePositives.join(', ') || 'yok'}`);
  console.log(`  ${ok(!s.polarityErrors.length)} kutup hatası: ${s.polarityErrors.join(' | ') || 'yok'}`);
  console.log(`  ${ok(!s.demographics.length)} demografi: ${s.demographics.join(' | ') || 'tam'}`);
  console.log(`  ${ok(s.examOk)} muayene sistemleri: [${s.gotSystems}] beklenen [${s.wantSystems}]`);
  console.log(`  ${ok(s.priorOk)} önceki tanı kaydı`);

  if (s.warnings.length) {
    console.log('  uyarılar:');
    for (const w of s.warnings) console.log(`     · ${w}`);
  }
  if (result.notes.length) {
    console.log('  sözlükte olmayanlar (KB büyütme sinyali):');
    for (const n of result.notes) console.log(`     · ${n}`);
  }

  const r = assess(result.case);
  console.log('  → motor çıktısı:');
  r.differential.slice(0, 3).forEach((d, i) => {
    console.log(`     ${i + 1}. ${(d.probability * 100).toFixed(1).padStart(5)}%  ${d.label}`);
  });
  console.log(`     sıradaki test: ${r.nextTests[0].label}`);
}

async function main() {
  if (!hasApiKey()) {
    console.error('ANTHROPIC_API_KEY tanımlı değil. Bu koşum gerçek API çağırır.');
    console.error('Birim testler için: npm test');
    process.exit(2);
  }

  const complete = createAnthropicTransport();
  let failed = 0;

  for (const fixture of FIXTURES) {
    let result;
    try {
      result = await extractCase(fixture.text, { complete });
    } catch (err) {
      console.error(`\n${fixture.id}: ÇIKARIM HATASI — ${err.message}`);
      failed += 1;
      continue;
    }
    const s = scoreOne(fixture, result);
    printScore(fixture, s, result);

    if (s.recall < PASS_THRESHOLD.recall
      || s.falsePositives.length > PASS_THRESHOLD.falsePositives
      || s.polarityErrors.length > PASS_THRESHOLD.polarityErrors) {
      failed += 1;
    }
  }

  console.log(`\n${'═'.repeat(70)}`);
  console.log(failed ? `${failed}/${FIXTURES.length} vaka eşiğin altında.` : `${FIXTURES.length}/${FIXTURES.length} vaka eşiği geçti.`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
