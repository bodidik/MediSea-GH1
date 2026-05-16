// server/controllers/sectionsController.js
import Content from '../models/Content.js';

/**
 * GET /api/sections/counts
 * Her bölüm için içerik sayısını döner: [{ section:'romatoloji', count: 12 }, ...]
 */
export async function getSectionCounts(_req, res) {
  try {
    const rows = await Content.aggregate([
      { $match: { status: { $ne: 'removed' } } },
      { $group: { _id: '$section', count: { $sum: 1 } } },
      { $project: { _id: 0, section: '$_id', count: 1 } },
      { $sort: { section: 1 } }
    ]);
    res.json({ ok: true, items: rows });
  } catch (e) {
    console.error('getSectionCounts error:', e);
    res.status(500).json({ ok: false, error: 'Internal error' });
  }
}
