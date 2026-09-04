import type { Request, Response } from 'express';
import * as slaService from '../services/sla.service.js';

export async function getSlaRules(req: Request, res: Response) {
    try {
        const rules = await slaService.getSlaRules();
        res.status(200).json(rules);
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}

export async function updateSlaRule(req: Request, res: Response) {
    try {
        const { responseTimeMinutes, resolutionTimeMinutes } = req.body;
        const rule = await slaService.updateSlaRule(req.params.priority as string, {
            responseTimeMinutes, resolutionTimeMinutes,
        });
        res.status(200).json(rule);
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}

export async function getTicketSlaStatus(req: Request, res: Response) {
    try {
        const status = await slaService.getTicketSlaStatus(req.params.id as string, req.user!);
        res.status(200).json(status);
    } catch (err: any) {
        res.status(err.message === 'Ticket not found' ? 404 : 403).json({ error: { message: err.message } });
    }
}
