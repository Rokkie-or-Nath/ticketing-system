import { Router } from 'express';
import * as ticketsController from '../controllers/tickets.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/requireRole.middleware.js';
import commentsRoutes from './comments.routes.ts';
import attachmentsRoutes from './attachments.routes.ts';
import * as slaController from '../controllers/sla.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', ticketsController.createTicket);
router.get('/', ticketsController.listTickets);
router.get('/:id', ticketsController.getTicketById);
router.patch('/:id', requireRole('agent', 'admin'), ticketsController.updateTicket);
router.patch('/:id/assign', requireRole('agent', 'admin'), ticketsController.assignTicket);
router.use('/:id/comments', commentsRoutes);
router.use('/:id/attachments', attachmentsRoutes);
router.get('/:id/sla-status', slaController.getTicketSlaStatus);

export default router;
