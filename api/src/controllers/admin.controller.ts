import type { Request, Response } from 'express';
import * as adminService from '../services/admin.service.js';

export async function getOverviewStats(req: Request, res: Response) {
    try {
        res.status(200).json(await adminService.getOverviewStats());
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}

export async function getSlaBreachStats(req: Request, res: Response) {
    try {
        res.status(200).json(await adminService.getSlaBreachStats());
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}

export async function getAgentStats(req: Request, res: Response) {
    try {
        res.status(200).json(await adminService.getAgentStats());
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}

export async function listUsers(req: Request, res: Response) {
    try {
        res.status(200).json(await adminService.listUsers());
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}

export async function updateUserRole(req: Request, res: Response) {
    try {
        const { role } = req.body;
        const user = await adminService.updateUserRole(req.params.id as string, role);
        res.status(200).json(user);
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}
