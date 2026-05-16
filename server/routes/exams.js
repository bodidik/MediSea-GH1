// server/routes/exams.js
import { Router } from 'express';
import Question from '../models/Question.js';

const router = Router();

/**
 * GET /api/exams/generate?examType=ydus&section=all&count=50&role=V
 * Rastgele sorular döner (rol'e göre maskelenmiş)
 */
router.get('/generate', async (req, res) => {
  try {
    const role = req.user?.role || req.query.role || 'V';
    const {
      examType = 'ydus',
      section = 'all',
      count = 50
    } = req.query;

    const match = { status: { $ne: 'removed' }, examType };
    if (section && section !== 'all') match.section = section;

    // örnekleme: RANDOM N
    const pipeline = [
      { $match: match },
      { $sample: { size: Number(count) } },
      { $project: {
          examType: 1, section: 1, title: 1, stem: 1, options: 1,
          correct: role === 'M' || role === 'P' ? 1 : 0,
          explain: role === 'P' ? 1 : 0
        }
      }
    ];

    const questions = await Question.aggregate(pipeline);
    res.json({ ok: true, items: questions });
  } catch (e) {
    console.error('generate exam error:', e);
    res.status(500).json({ ok:false, error:'Server error' });
  }
});

export default router;
