// server/controllers/sectionContentController.js
import Content from '../models/Content.js';

/** V/M/P’ye göre alanları maskele */
function maskByRole(doc, role) {
  const base = {
    _id: doc._id,
    title: doc.title,
    section: doc.section,
    teaser: doc.teaser || '',
    premiumOnly: !!doc.premiumOnly,
  };
  if ((role === 'M' || role === 'P') && (!doc.premiumOnly || role !== 'V')) {
    base.body_general = doc.body_general || '';
  }
  if (role === 'P' && doc.body_deep) {
    base.body_deep = doc.body_deep;
  }
  return base;
}

/** GET /api/section-content/:section?q=&limit=&skip=&role=V|M|P */
export async function listBySection(req, res) {
  try {
    const role = req.user?.role || req.query.role || 'V';
    const { section } = req.params;
    const { q, limit = 24, skip = 0 } = req.query;

    const filt = { status: { $ne: 'removed' } };
    if (section && section !== 'all') filt.section = section;
    if (q) {
      filt.$or = [
        { title: { $regex: q, $options: 'i' } },
        { teaser: { $regex: q, $options: 'i' } },
        { body_general: { $regex: q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Content.find(filt).sort({ _id: -1 }).skip(Number(skip)).limit(Number(limit)).lean(),
      Content.countDocuments(filt),
    ]);

    res.json({ ok: true, total, items: items.map(d => maskByRole(d, role)) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Internal error' });
  }
}
