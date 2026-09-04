import type { Request, Response } from 'express';
import * as ticketsService from '../services/tickets.service.js';

export async function createTicket(req: Request, res: Response) {
    try {
        const { subject, description, category, priority } = req.body;
        const ticket = await ticketsService.createTicket(req.user!.userId, {
            subject, description, category, priority,
        });
        res.status(201).json(ticket);
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}

export async function listTickets(req: Request, res: Response) {
    try {
        const { status, priority, category, query, page, limit } = req.query;
        const result = await ticketsService.listTickets(req.user!, {
            status: status as string,
            priority: priority as string,
            category: category as string,
            query: query as string,
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
        });
        res.status(200).json(result);
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}

export async function getTicketById(req: Request, res: Response) {
    try {
        const result = await ticketsService.getTicketById(req.params.id as string, req.user!);
        res.status(200).json(result);
    } catch (err: any) {
        res.status(err.message === 'Ticket not found' ? 404 : 403).json({ error: { message: err.message } });
    }
}

export async function updateTicket(req: Request, res: Response) {
    try {
        const { status, priority, category } = req.body;
        const ticket = await ticketsService.updateTicket(req.params.id as string, req.user!.userId, {
            status, priority, category,
        });
        res.status(200).json(ticket);
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}

export async function assignTicket(req: Request, res: Response) {
    try {
        const { assigneeId } = req.body;
        const ticket = await ticketsService.assignTicket(req.params.id as string, req.user!.userId, assigneeId || req.user!.userId);
        res.status(200).json(ticket);
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}
