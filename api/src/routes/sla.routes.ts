import { Router } from 'express';
import * as slaController from '../controllers/sla.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/requireRole.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/sla-rules', slaController.getSlaRules);
router.patch('/sla-rules/:priority', requireRole('admin'), slaController.updateSlaRule);

export default router;
