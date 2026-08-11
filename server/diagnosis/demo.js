// FILE: server/diagnosis/demo.js
//
// Calistir:  node diagnosis/demo.js
//
// Vakayi motordan gecirir ve her adimin yuzdeye katkisini yazdirir.
// Amac: sayilarin nereden geldigini gozle denetlenebilir kilmak.

import { assess } from './index.js';
import { BOXES } from './intake.js';
import { VIGNETTE_59M_FATIGUE, VIGNETTE_59M_FATIGUE_FULL } from './cases/vignette59mFatigue.js';

const pct = (p) => `${(p * 100).toFixed(1)}%`;
const bar = (p) => '█'.repeat(Math.max(0, Math.round(p * 40)));

function printDifferential(differential, limit = 8) {
  differential.slice(0, limit).forEach((d, i) => {
    console.log(`  ${String(i + 1).padStart(2)}. ${pct(d.probability).padStart(6)}  ${bar(d.probability)} ${d.label}`);
  });
}

function printTrace(entry) {
  console.log(`\n  Gerekçe — ${entry.label} (ön-test ${pct(entry.prior)} → ${pct(entry.probability)})`);
  for (const c of entry.contributions) {
    if (Math.abs(c.logLR) < 0.01) continue;
    const factor = Math.exp(c.logLR);
    const arrow = c.logLR > 0 ? '↑' : '↓';
    const state = c.source === 'finding' ? (c.present ? 'var' : 'yok') : c.source;
    const box = c.boxLabel ? `${c.boxLabel} · ` : '';
    const tags = [
      c.discounted ? 'küme indirimi' : null,
      c.inferred ? 'muayene özetinden' : null,
      c.axis === 'risk' ? 'risk' : null,
    ].filter(Boolean);
    const tail = tags.length ? `  [${tags.join(', ')}]` : '';
    console.log(`     ${arrow} ×${factor.toFixed(2).padStart(5)}  ${box}${c.label} (${state})${tail}`);
  }
}

function printBoxes(r) {
  const parts = Object.entries(r.patient.boxCounts)
    .map(([box, n]) => `${BOXES[box].label}: ${n || '—'}`);
  console.log(`  Kutular: ${parts.join('  |  ')}`);
  if (r.exam.inferredNegatives) {
    console.log(`  Muayene: ${r.exam.normalSystems.join(', ')} normal`
      + ` → ${r.exam.inferredNegatives} anlamlı negatif çıkarıldı`);
  }
}

function run(title, caseInput) {
  console.log(`\n${'═'.repeat(72)}\n${title}\n${'═'.repeat(72)}`);
  const r = assess(caseInput);
  if (r.warnings.length) console.log('  ! uyarılar:', r.warnings.join('; '));
  console.log(`  Hasta: ${r.patient.age}y ${r.patient.sex}, seyir: ${r.patient.tempo}`);
  printBoxes(r);
  console.log(`  Belirsizlik: ${r.entropyBits.toFixed(2)} bit\n`);
  printDifferential(r.differential);
  printTrace(r.differential[0]);

  if (r.missingExam.length) {
    console.log(`\n  Önce muayene (bedava): ${r.missingExam.map((m) => m.system).join(', ')}`);
  }

  console.log('\n  Sonraki test (bilgi kazancı / maliyet):');
  for (const t of r.nextTests) {
    console.log(
      `     ${t.label.padEnd(34)} ${t.uncertaintyReductionPct.toFixed(0).padStart(3)}% belirsizlik ↓`
      + `  ${t.infoGainBits.toFixed(2)} bit  maliyet ${t.rawCost}`,
    );
  }

  const flags = r.redFlags.mustExclude;
  if (flags.length) {
    console.log('\n  Kaçırılmaması gerekenler (düşük olasılık, yüksek risk):');
    for (const f of flags) {
      console.log(
        `     ${f.label.padEnd(34)} P=${pct(f.probability).padStart(6)}`
        + `  beklenen zarar ${f.expectedHarm.toFixed(3)}  →  ${f.discriminatingTest?.label ?? '-'}`,
      );
    }
  }
  return r;
}

const base = VIGNETTE_59M_FATIGUE;
run('VAKA — yalnızca hikâye kutusu (metinde olan her şey)', base);

run('AYNI VAKA — muayene, özgeçmiş, ilaç, soygeçmiş, alışkanlık kutuları dolu',
  VIGNETTE_59M_FATIGUE_FULL);

// Kalsiyum yuksek gelirse
run('AYNI VAKA + serum kalsiyum YÜKSEK', {
  ...base,
  testResults: [{ test: 'serum_calcium', result: 'high' }],
});

// Kalsiyum + PTH
run('AYNI VAKA + kalsiyum YÜKSEK + PTH uygunsuz normal/yüksek', {
  ...base,
  testResults: [
    { test: 'serum_calcium', result: 'high' },
    { test: 'pth', result: 'high_or_inappropriate' },
  ],
});

// Negatif kontrol: kalsiyum normal cikarsa liste degismeli
run('NEGATİF KONTROL — kalsiyum NORMAL', {
  ...base,
  testResults: [{ test: 'serum_calcium', result: 'normal' }],
});
