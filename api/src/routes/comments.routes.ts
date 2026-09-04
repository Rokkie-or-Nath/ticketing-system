import { Router } from 'express';
import * as commentsController from '../controllers/comments.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', commentsController.addComment);
router.get('/', commentsController.listComments);

export default router;
