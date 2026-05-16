// Bölüm içerik sayıları – Section modeline gerek yok.
// Her bir Content dokümanında `section` alanı (örn. 'romatoloji') var.
import { Router } from 'express';
import Content from '../models/Content.js';

const router = Router();

/**
 * GET /with-count
 * Sonuç: [{ section: 'romatoloji', count: 12 }, ...]
 *
 * İstersen /counts yapmak istersen aşağıdaki route path'ini '/counts' olarak değiştir.
 */
router.get('/with-count', async (_req, res) => {
  try {
    const rows = await Content.aggregate([
      { $match: { status: { $ne: 'removed' } } },   // silinmişleri hariç tut
      { $group: { _id: '$section', count: { $sum: 1 } } },
      { $project: { _id: 0, section: '$_id', count: 1 } },
      { $sort: { section: 1 } },
    ]);

    res.json({ ok: true, items: rows });
  } catch (err) {
    console.error('with-count error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

export default router;
