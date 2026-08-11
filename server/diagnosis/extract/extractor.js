// FILE: server/diagnosis/extract/extractor.js
//
// Katman 1: serbest metin -> motorun anladigi kutulu vaka nesnesi.
//
// Tasiyici (transport) disaridan verilir. Bunun tek sebebi test edilebilirlik:
// motor deterministiktir ve dogrudan test edilir, cikarim ise degildir.
// Bu yuzden cikarimin GUVENCESI testten degil KISITLAMADAN gelir:
//
//   1. kapali sozluk    -> model var olmayan kod uretemez        (vocabulary.js)
//   2. alinti baglama   -> uydurdugu bulgu metne karsi dusurulur (verify.js)
//   3. sema             -> olasilik/tani siralama alani yok      (prompt.js)
//   4. kanonik kutu     -> kutuyu model degil KB belirler        (asagida)
//
// Testler bu dort kisitin CALISTIGINI dogrular; modelin dogru cevap verdigini
// degil. Modelin isabetini olcmek icin ayri bir kosum var: eval.js.

import { defaultKb } from '../kb/index.js';
import { BOX_IDS } from '../intake.js';
import { systemPrompt, userPrompt, extractionSchema, TOOL_NAME } from './prompt.js';
import { verifyQuotes, detectLayerLeak } from './verify.js';

export const MAX_TEXT_LENGTH = 20000;

/**
 * @param {string} text  serbest hasta metni
 * @param {object} options
 *   complete: async ({ system, user, schema, toolName }) => object   (zorunlu)
 *   kb, onUngrounded: 'drop' | 'flag'
 * @returns {{ case, warnings, notes, priorDiagnoses, raw, stats }}
 */
export async function extractCase(text, options = {}) {
  const kb = options.kb ?? defaultKb;
  const complete = options.complete;
  if (typeof complete !== 'function') {
    throw new Error('extractCase: options.complete (taşıyıcı fonksiyon) zorunlu');
  }

  const source = String(text ?? '').trim();
  if (!source) throw new Error('extractCase: metin boş');
  if (source.length > MAX_TEXT_LENGTH) {
    throw new Error(`extractCase: metin çok uzun (${source.length} > ${MAX_TEXT_LENGTH})`);
  }

  const raw = await complete({
    system: systemPrompt(kb),
    user: userPrompt(source),
    schema: extractionSchema(kb),
    toolName: TOOL_NAME,
  });

  return assembleCase(source, raw, { kb, onUngrounded: options.onUngrounded });
}

/**
 * Ham model ciktisini dogrulayip vaka nesnesine cevirir.
 * extractCase'ten ayri tutuldu: tasiyicisiz, saf ve dogrudan test edilebilir.
 */
export function assembleCase(source, raw, options = {}) {
  const kb = options.kb ?? defaultKb;
  const warnings = [];

  if (!raw || typeof raw !== 'object') {
    throw new Error('Çıkarım katmanı geçersiz yanıt döndürdü (nesne bekleniyordu)');
  }

  // --- bulgular: once kod, sonra alinti dogrulamasi ---
  const known = [];
  for (const item of Array.isArray(raw.findings) ? raw.findings : []) {
    const code = item?.code;
    if (!kb.findings[code]) {
      warnings.push(`Sözlükte olmayan kod atıldı: "${code}"`);
      continue;
    }
    if (typeof item.present !== 'boolean') {
      warnings.push(`"${code}": present alanı boolean değil, atıldı`);
      continue;
    }
    known.push(item);
  }

  const verified = verifyQuotes(source, known, {
    onUngrounded: options.onUngrounded,
    label: 'bulgu',
  });
  warnings.push(...verified.warnings);

  // --- kutu KANONIKTIR: modelin dedigi degil, KB'nin dedigi gecerlidir ---
  const boxed = Object.fromEntries(BOX_IDS.map((b) => [b, []]));
  const seen = new Map();

  for (const item of verified.kept) {
    const canonicalBox = kb.findings[item.code].box;
    if (item.box && item.box !== canonicalBox) {
      warnings.push(
        `"${item.code}" kutusu düzeltildi: ${item.box} → ${canonicalBox}`,
      );
    }
    const prev = seen.get(item.code);
    if (prev) {
      if (prev.present !== item.present) {
        warnings.push(`"${item.code}" hem var hem yok kodlanmış; ilk kayıt korundu`);
      }
      continue;
    }
    const entry = {
      code: item.code,
      present: item.present,
      quote: item.quote,
      grounded: item.grounded,
    };
    seen.set(item.code, entry);
    boxed[canonicalBox].push(entry);
  }

  // --- muayene: normal sistemler de alintiyla temellendirilir ---
  const examVerified = verifyQuotes(source, raw.examNormalSystems ?? [], {
    onUngrounded: options.onUngrounded,
    label: 'muayene sistemi',
  });
  warnings.push(...examVerified.warnings);

  const normalSystems = [];
  for (const item of examVerified.kept) {
    if (normalSystems.includes(item.system)) continue;
    // Sistemi normal ilan edilmisken ayni sistemden VAR bir bulgu kodlanmissa
    // celiski vardir; intake acikca yazilani korur, biz sadece uyariyoruz.
    const conflict = boxed.exam.find(
      (e) => e.present && kb.findings[e.code].system === item.system,
    );
    if (conflict) {
      warnings.push(
        `"${item.system}" normal denmiş ama aynı sistemde "${conflict.code}" var kodlanmış`,
      );
    }
    normalSystems.push(item.system);
  }

  // --- onceki tanilar: kayit altina alinir, KANIT OLARAK BESLENMEZ ---
  const priorVerified = verifyQuotes(source, raw.priorDiagnoses ?? [], {
    onUngrounded: options.onUngrounded,
    label: 'önceki tanı',
  });
  warnings.push(...priorVerified.warnings);

  const leak = detectLayerLeak(Array.isArray(raw.notes) ? raw.notes : []);
  warnings.push(...leak.warnings);

  const caseObject = {
    age: Number.isFinite(raw.age) ? raw.age : null,
    sex: raw.sex === 'M' || raw.sex === 'F' ? raw.sex : null,
    durationMonths: Number.isFinite(raw.durationMonths) ? raw.durationMonths : null,
    ...boxed,
    exam: { normalSystems, findings: boxed.exam },
    priorDiagnoses: priorVerified.kept.map((d) => ({
      label: d.label,
      confirmed: Boolean(d.confirmed),
      quote: d.quote,
    })),
    testResults: [],
  };

  if (caseObject.age === null) warnings.push('Yaş çıkarılamadı');
  if (caseObject.sex === null) warnings.push('Cinsiyet çıkarılamadı');
  if (caseObject.durationMonths === null) {
    warnings.push('Süre çıkarılamadı — seyir "subakut" varsayılacak');
  }

  return {
    case: caseObject,
    warnings,
    notes: leak.clean,
    priorDiagnoses: caseObject.priorDiagnoses,
    raw,
    stats: {
      proposed: Array.isArray(raw.findings) ? raw.findings.length : 0,
      accepted: seen.size,
      unknownCode: (Array.isArray(raw.findings) ? raw.findings.length : 0) - known.length,
      ungrounded: verified.dropped.length,
      negatives: [...seen.values()].filter((e) => !e.present).length,
    },
  };
}
