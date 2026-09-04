import { Router } from 'express';
import * as attachmentsController from '../controllers/attachments.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);
router.delete('/:attachmentId', attachmentsController.deleteAttachment);

export default router;
