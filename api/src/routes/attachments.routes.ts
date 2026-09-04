import { Router } from 'express';
import * as attachmentsController from '../controllers/attachments.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../config/upload.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', upload.single('file'), attachmentsController.addAttachment);
router.get('/', attachmentsController.listAttachments);

export default router;
