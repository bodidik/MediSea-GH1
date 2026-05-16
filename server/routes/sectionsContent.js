import { Router } from 'express';
import { listBySection } from '../controllers/sectionContentController.js';

const router = Router();
// Örn: /api/section-content/romatoloji?role=V
router.get('/:section', listBySection);

export default router;
