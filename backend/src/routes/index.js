import { Router } from 'express';
import health from './health.route.js';
import imports from './imports.route.js';

const router = Router();

router.use('/health', health);
router.use('/imports', imports);

export default router;
