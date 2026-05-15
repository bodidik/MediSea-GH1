// server/routes/sectionsCounts.js
import { Router } from 'express';
import Content from '../models/Content.js';

const router = Router();

/**
 * Kanonik bölüm anahtarları (UI ve sıralama için)
 * İstersen burayı merkezi bir config'e alabiliriz.
 */
const CANONICAL_SECTIONS = [
  'romatoloji',
  'hematoloji',
  'gastroenteroloji',
  'endokrinoloji',
  'geriatri',
  'nefroloji',
  'onkoloji',
  'immünoloji',
  'kardiyoloji',
  'infeksiyon',
  'göğüs'
];

/** Yardımcı: counts dizisini kanonik listeye göre 0’larla doldur */
function zeroFillCounts(canonical, counts) {
  const map = new Map(counts.map(c => [c.section, c.count]));
  return canonical.map(key => ({
    section: key,
    count: Number(map.get(key) || 0)
  }));
}

/** Yardımcı: toplam say */
function sumCounts(items) {
  return items.reduce((acc, it) => acc + Number(it.count || 0), 0);
}

/**
 * GET /api/sections/with-count
 * Query (opsiyonel):
 *   - sections=romatoloji,kardiyoloji,...  (default: CANONICAL_SECTIONS)
 *   - includeZero=false|true               (default: true)
 * Dönüş:
 * {
 *   ok: true,
 *   all:     [{ section:'romatoloji', count:12 }, ...],
 *   premium: [{ section:'romatoloji', count: 4 }, ...],
 *   totals:  { all: 12, premium: 4, free: 8 }
 * }
 */
router.get('/with-count', async (req, res) => {
  try {
    const { sections, includeZero = 'true' } = req.query;
    const wanted = (sections?.split(',').map(s => s.trim()).filter(Boolean)) || CANONICAL_SECTIONS;
    const doZeroFill = String(includeZero).toLowerCase() !== 'false';

    const allCountsRaw = await Content.aggregate([
      { $match: { status: { $ne: 'removed' } } },
      { $group: { _id: '$section', count: { $sum: 1 } } },
      { $project: { _id: 0, section: '$_id', count: 1 } }
    ]);

    const premiumCountsRaw = await Content.aggregate([
      { $match: { status: { $ne: 'removed' }, premiumOnly: true } },
      { $group: { _id: '$section', count: { $sum: 1 } } },
      { $project: { _id: 0, section: '$_id', count: 1 } }
    ]);

    // Sadece istenen bölümler + (opsiyonel) zero-fill
    const filterToWanted = (arr) => arr.filter(it => wanted.includes(it.section));
    const allCounts     = doZeroFill ? zeroFillCounts(wanted, filterToWanted(allCountsRaw)) : filterToWanted(allCountsRaw);
    const premiumCounts = doZeroFill ? zeroFillCounts(wanted, filterToWanted(premiumCountsRaw)) : filterToWanted(premiumCountsRaw);

    // Toplamlar
    const totalsAll     = sumCounts(allCounts);
    const totalsPremium = sumCounts(premiumCounts);

    res.json({
      ok: true,
      all: allCounts,
      premium: premiumCounts,
      totals: {
        all: totalsAll,
        premium: totalsPremium,
        free: Math.max(0, totalsAll - totalsPremium)
      }
    });
  } catch (err) {
    console.error('with-count error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

/**
 * GET /api/sections/counts
 * Tek listede toplu görünüm (UI için pratik):
 * [
 *   { section:'romatoloji', all: 12, premium: 4, free: 8 },
 *   ...
 * ]
 * Query (opsiyonel): sections, includeZero (bkz: /with-count)
 */
router.get('/counts', async (req, res) => {
  try {
    const { sections, includeZero = 'true' } = req.query;
    const wanted = (sections?.split(',').map(s => s.trim()).filter(Boolean)) || CANONICAL_SECTIONS;
    const doZeroFill = String(includeZero).toLowerCase() !== 'false';

    const [allCountsRaw, premiumCountsRaw] = await Promise.all([
      Content.aggregate([
        { $match: { status: { $ne: 'removed' } } },
        { $group: { _id: '$section', count: { $sum: 1 } } },
        { $project: { _id: 0, section: '$_id', count: 1 } }
      ]),
      Content.aggregate([
        { $match: { status: { $ne: 'removed' }, premiumOnly: true } },
        { $group: { _id: '$section', count: { $sum: 1 } } },
        { $project: { _id: 0, section: '$_id', count: 1 } }
      ])
    ]);

    const filterToWanted = (arr) => arr.filter(it => wanted.includes(it.section));
    const allCounts     = doZeroFill ? zeroFillCounts(wanted, filterToWanted(allCountsRaw)) : filterToWanted(allCountsRaw);
    const premiumCounts = doZeroFill ? zeroFillCounts(wanted, filterToWanted(premiumCountsRaw)) : filterToWanted(premiumCountsRaw);

    // Map’le birleştir
    const mapAll     = new Map(allCounts.map(it => [it.section, it.count]));
    const mapPremium = new Map(premiumCounts.map(it => [it.section, it.count]));
    const items = (doZeroFill ? wanted : Array.from(new Set([...allCounts.map(i=>i.section), ...premiumCounts.map(i=>i.section)])))
      .map(section => {
        const a = Number(mapAll.get(section) || 0);
        const p = Number(mapPremium.get(section) || 0);
        return { section, all: a, premium: p, free: Math.max(0, a - p) };
      });

    res.json({ ok: true, items });
  } catch (err) {
    console.error('counts error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

/**
 * GET /api/sections/list
 * UI dropdown için ham liste
 */
router.get('/list', (_req, res) => {
  res.json({ ok: true, items: CANONICAL_SECTIONS });
});

/**
 * GET /api/sections/:section/summary
 * Tek bölüm özeti:
 * { ok:true, section:'romatoloji', all:12, premium:4, free:8 }
 */
router.get('/:section/summary', async (req, res) => {
  try {
    const section = req.params.section;

    const [allOne, premiumOne] = await Promise.all([
      Content.countDocuments({ status: { $ne: 'removed' }, section }),
      Content.countDocuments({ status: { $ne: 'removed' }, section, premiumOnly: true })
    ]);

    res.json({
      ok: true,
      section,
      all: allOne,
      premium: premiumOne,
      free: Math.max(0, allOne - premiumOne)
    });
  } catch (err) {
    console.error('section summary error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

export default router;
