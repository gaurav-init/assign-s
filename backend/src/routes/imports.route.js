import { Router } from 'express';
import { upload } from '../middleware/upload.middleware.js';
import { rateLimit } from '../middleware/rate-limit.middleware.js';
import {
  parseUpload,
  extractImport,
  history,
  historyDetail,
} from '../controllers/imports.controller.js';

const router = Router();

router.post('/parse', rateLimit, upload.single('file'), parseUpload);
router.get('/history', history);
router.get('/history/:importId', historyDetail);
router.post('/:importId/extract', rateLimit, extractImport);

export default router;
