// FILE: server/diagnosis/extract/verify.js
//
// Cikarimin ikinci savunma hatti: ALINTI BAGLAMA.
//
// Kapali sozluk modelin var olmayan bir KOD uretmesini engeller, ama var olan
// bir kodu metinde gecmeyen bir seyden turetmesini engellemez. Bunun tek ucuz
// panzehiri, her bulgu icin metinden birebir alinti istemek ve o alintinin
// gercekten metinde gectigini programla dogrulamaktir.
//
// Dogrulanamayan bulgu VARSAYILAN OLARAK DUSURULUR. Tibbi bir aracta
// temellendirilmemis bulgu, eksik bulgudan tehlikelidir.

const MIN_QUOTE_LENGTH = 3;

/**
 * Karsilastirma icin normalize eder: Turkce kucuk harf, noktalama ve fazla
 * bosluk atilir. Modelin noktalama/bosluk farki yuzunden dogru alintisi
 * reddedilmesin diye.
 */
export function normalizeForMatch(s) {
  return String(s ?? '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** Alinti kaynak metinde geciyor mu? */
export function isGrounded(sourceText, quote) {
  const needle = normalizeForMatch(quote);
  if (needle.length < MIN_QUOTE_LENGTH) return false;
  return normalizeForMatch(sourceText).includes(needle);
}

/**
 * Model ciktisindaki her alintiyi kaynak metne karsi dogrular.
 *
 * @param {string} sourceText
 * @param {Array<{quote: string}>} items
 * @param {object} [options] { onUngrounded: 'drop' | 'flag', label }
 * @returns {{ kept: Array, dropped: Array, warnings: string[] }}
 */
export function verifyQuotes(sourceText, items, options = {}) {
  const mode = options.onUngrounded ?? 'drop';
  const label = options.label ?? 'bulgu';
  const kept = [];
  const dropped = [];
  const warnings = [];

  for (const item of items ?? []) {
    const grounded = isGrounded(sourceText, item.quote);
    if (grounded) {
      kept.push({ ...item, grounded: true });
      continue;
    }
    const name = item.code ?? item.system ?? item.label ?? '?';
    const shown = String(item.quote ?? '').slice(0, 60);
    warnings.push(
      `Metinde doğrulanamayan ${label}: "${name}" — alıntı metinde geçmiyor: "${shown}"`,
    );
    if (mode === 'flag') kept.push({ ...item, grounded: false });
    else dropped.push(item);
  }

  return { kept, dropped, warnings };
}

/**
 * Modelin sinirini asip asmadigini denetler. Sema zaten olasilik alani
 * icermiyor, ama model serbest alanlara (notes) yuzde/tani siralamasi
 * sizdirabilir. Katmanlar arasindaki sinir sessizce delinmemeli.
 */
const LEAK_PATTERNS = [
  /%\s*\d/,
  /\b\d{1,3}\s*(%|yüzde)/i,
  /\bolasılı\w*\s*[:=]/i,
  /\bprobabilit/i,
  /\bön\s*tanı\s*[:=]/i,
];

export function detectLayerLeak(notes = []) {
  const warnings = [];
  for (const note of notes) {
    if (LEAK_PATTERNS.some((re) => re.test(String(note)))) {
      warnings.push(
        `Çıkarım katmanı sınırını aştı (olasılık/ön tanı üretmiş), not yok sayıldı: "${String(note).slice(0, 80)}"`,
      );
    }
  }
  return {
    clean: notes.filter((n) => !LEAK_PATTERNS.some((re) => re.test(String(n)))),
    warnings,
  };
}
