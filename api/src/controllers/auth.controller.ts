import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';

export async function signup(req: Request, res: Response) {
    try {
        const { name, email, password } = req.body;
        const { user, token } = await authService.signup(name, email, password);
        res.status(201).json({ user, token });
    } catch (err: any) {
        res.status(400).json({ error: { message: err.message } });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.login(email, password);
        res.status(200).json({ user, token });
    } catch (err: any) {
        res.status(401).json({ error: { message: err.message } });
    }
}
