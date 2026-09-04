import { Router } from 'express';
import * as ticketsController from '../controllers/tickets.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate); // every ticket route requires login

router.post('/', ticketsController.createTicket);
router.get('/', ticketsController.listTickets);

export default router;
