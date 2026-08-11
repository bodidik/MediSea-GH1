// FILE: server/diagnosis/calibration.js
//
// Kalibrasyonu olcmeyen bir tani makinesi, guzel gorunen bir yalancidir.
// Motorun "%70" dedigi vakalarin gercekten ~%70'i o tani mi cikiyor?
//
// Brier (cok sinifli) : 0 mukemmel, 2 en kotu. Tesadufi tahminden iyi mi?
// ECE                 : guven ile gerceklesme arasindaki ortalama sapma.
// Kalibrasyon egrisi  : hangi guven araliginda ne kadar sapiyoruz.

/** Kayittan olasilik haritasi cikarir (differential dizisi veya duz obje). */
function probsOf(record) {
  if (record.probabilities instanceof Map) return record.probabilities;
  if (Array.isArray(record.differential)) {
    return new Map(record.differential.map((d) => [d.id, d.probability]));
  }
  if (record.probabilities) return new Map(Object.entries(record.probabilities));
  throw new Error('Kayıtta probabilities veya differential bulunamadı');
}

function classesOf(records) {
  const set = new Set();
  for (const r of records) {
    for (const key of probsOf(r).keys()) set.add(key);
    if (r.actual) set.add(r.actual);
  }
  return [...set];
}

/** Cok sinifli Brier skoru: (1/N) Σ Σ (p - y)². */
export function multiclassBrier(records) {
  if (!records.length) return 0;
  const classes = classesOf(records);
  let total = 0;
  for (const r of records) {
    const p = probsOf(r);
    for (const c of classes) {
      const y = r.actual === c ? 1 : 0;
      const diff = (p.get(c) ?? 0) - y;
      total += diff * diff;
    }
  }
  return total / records.length;
}

/** Dogru taniya atanan olasiligin log kaybi. Kucuk daha iyi. */
export function logLoss(records, epsilon = 1e-9) {
  if (!records.length) return 0;
  let total = 0;
  for (const r of records) {
    const p = probsOf(r).get(r.actual) ?? 0;
    total -= Math.log(Math.max(p, epsilon));
  }
  return total / records.length;
}

/**
 * En yuksek olasilikli tani icin kalibrasyon egrisi.
 * Her kova icin: kac vaka, ortalama guven, gercek isabet orani.
 */
export function calibrationCurve(records, bins = 10) {
  const buckets = Array.from({ length: bins }, (_, i) => ({
    from: i / bins,
    to: (i + 1) / bins,
    n: 0,
    confidenceSum: 0,
    hits: 0,
  }));

  for (const r of records) {
    const p = probsOf(r);
    let topId = null;
    let topP = -1;
    for (const [id, value] of p) {
      if (value > topP) { topP = value; topId = id; }
    }
    if (topId === null) continue;
    const idx = Math.min(bins - 1, Math.floor(topP * bins));
    const b = buckets[idx];
    b.n += 1;
    b.confidenceSum += topP;
    if (topId === r.actual) b.hits += 1;
  }

  return buckets.map((b) => ({
    from: b.from,
    to: b.to,
    n: b.n,
    meanConfidence: b.n ? b.confidenceSum / b.n : null,
    accuracy: b.n ? b.hits / b.n : null,
    gap: b.n ? b.hits / b.n - b.confidenceSum / b.n : null,
  }));
}

/** Beklenen kalibrasyon hatasi: kova buyuklugune gore agirlikli |guven - isabet|. */
export function expectedCalibrationError(records, bins = 10) {
  const curve = calibrationCurve(records, bins);
  const n = records.length;
  if (!n) return 0;
  let ece = 0;
  for (const b of curve) {
    if (!b.n) continue;
    ece += (b.n / n) * Math.abs(b.accuracy - b.meanConfidence);
  }
  return ece;
}

/** Ilk k tani icinde dogru taninin bulunma orani. */
export function topKAccuracy(records, k = 3) {
  if (!records.length) return 0;
  let hits = 0;
  for (const r of records) {
    const ranked = [...probsOf(r).entries()].sort((a, b) => b[1] - a[1]).slice(0, k);
    if (ranked.some(([id]) => id === r.actual)) hits += 1;
  }
  return hits / records.length;
}

export function calibrationReport(records, bins = 10) {
  return {
    n: records.length,
    brier: multiclassBrier(records),
    logLoss: logLoss(records),
    ece: expectedCalibrationError(records, bins),
    top1: topKAccuracy(records, 1),
    top3: topKAccuracy(records, 3),
    curve: calibrationCurve(records, bins),
  };
}
