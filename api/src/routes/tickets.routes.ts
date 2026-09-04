import { Router } from 'express';
import * as ticketsController from '../controllers/tickets.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/requireRole.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', ticketsController.createTicket);
router.get('/', ticketsController.listTickets);
router.get('/:id', ticketsController.getTicketById);
router.patch('/:id', requireRole('agent', 'admin'), ticketsController.updateTicket);
router.patch('/:id/assign', requireRole('agent', 'admin'), ticketsController.assignTicket);

export default router;
