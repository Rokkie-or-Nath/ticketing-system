import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/requireRole.middleware.js';

const router = Router();

router.use(authenticate, requireRole('admin')); // every admin route requires admin role

router.get('/stats/overview', adminController.getOverviewStats);
router.get('/stats/sla-breaches', adminController.getSlaBreachStats);
router.get('/stats/agents', adminController.getAgentStats);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/role', adminController.updateUserRole);

export default router;
