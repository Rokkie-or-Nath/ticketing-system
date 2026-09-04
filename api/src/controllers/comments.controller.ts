import type { Request, Response } from 'express';
import * as commentsService from '../services/comments.service.js';

export async function addComment(req: Request, res: Response) {
    try {
        const { message, isInternal } = req.body;

        // Only agents/admins can post internal notes — force false for employees
        const internal = req.user!.role === 'employee' ? false : Boolean(isInternal);

        const comment = await commentsService.addComment(
            req.params.id as string,
            req.user!.userId,
            message,
            internal
        );
        res.status(201).json(comment);
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}

export async function listComments(req: Request, res: Response) {
    try {
        const comments = await commentsService.listComments(req.params.id as string, req.user!.role);
        res.status(200).json(comments);
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}
