// FILE: server/diagnosis/extract/vocabulary.js
//
// Modele gosterilecek KAPALI sozluk. Bilgi tabanindan uretilir, elle yazilmaz:
// KB'ye bulgu eklendiginde cikarim katmani kendiliginden ogrenir.
//
// Kapali sozluk, uydurmaya karsi ilk savunmadir: model serbest metin degil,
// yalnizca buradaki kodlari uretebilir. Ikinci savunma alinti baglamadir
// (bkz. verify.js).

import { defaultKb } from '../kb/index.js';
import { EXAM_SYSTEMS } from '../kb/findings.js';
import { BOXES, BOX_IDS } from '../intake.js';

const SYSTEM_LABELS = {
  general: 'genel görünüm',
  skin: 'cilt',
  neck: 'boyun',
  abdomen: 'batın',
  neuro: 'nörolojik',
  cardiovascular: 'kardiyovasküler',
};

/** Kutulara gore gruplanmis, prompt'a gomulecek kod listesi. */
export function vocabularyBlock(kb = defaultKb) {
  const byBox = new Map(BOX_IDS.map((b) => [b, []]));

  for (const code of kb.findingIds) {
    const f = kb.findings[code];
    const tags = [];
    if (f.axis === 'risk') tags.push('risk');
    if (f.system) tags.push(SYSTEM_LABELS[f.system] ?? f.system);
    byBox.get(f.box)?.push(`  ${code} = ${f.label}${tags.length ? ` (${tags.join(', ')})` : ''}`);
  }

  const blocks = [];
  for (const box of BOX_IDS) {
    const lines = byBox.get(box);
    if (!lines?.length) continue;
    blocks.push(`[${box}] ${BOXES[box].label}\n${lines.join('\n')}`);
  }
  return blocks.join('\n\n');
}

export function examSystemsBlock() {
  return EXAM_SYSTEMS.map((s) => `  ${s} = ${SYSTEM_LABELS[s] ?? s}`).join('\n');
}

/** Modelin uretebilecegi tum kodlar - sema ve dogrulama icin. */
export function allowedCodes(kb = defaultKb) {
  return [...kb.findingIds];
}

export function allowedSystems() {
  return [...EXAM_SYSTEMS];
}
