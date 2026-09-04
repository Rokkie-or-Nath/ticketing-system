import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../config/db.js';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: { message: 'No token provided' } });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
            role: 'employee' | 'agent' | 'admin';
        };

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const revoked = await pool.query(
            'SELECT 1 FROM revoked_tokens WHERE token_hash = $1',
            [tokenHash]
        );
        if (revoked.rows.length > 0) {
            return res.status(401).json({ error: { message: 'Token has been revoked' } });
        }

        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: { message: 'Invalid or expired token' } });
    }
}
