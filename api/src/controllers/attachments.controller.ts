import type { Request, Response } from 'express';
import * as attachmentsService from '../services/attachments.service.js';

export async function addAttachment(req: Request, res: Response) {
    try {
        if (!req.file) throw new Error('No file uploaded');

        const attachment = await attachmentsService.addAttachment(
            req.params.id as string,
            req.user!.userId,
            req.file
        );
        res.status(201).json(attachment);
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}

export async function listAttachments(req: Request, res: Response) {
    try {
        const attachments = await attachmentsService.listAttachments(req.params.id as string);
        res.status(200).json(attachments);
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}

export async function deleteAttachment(req: Request, res: Response) {
    try {
        await attachmentsService.deleteAttachment(
            req.params.attachmentId as string,
            req.user!.userId,
            req.user!.role
        );
        res.status(204).send();
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}
