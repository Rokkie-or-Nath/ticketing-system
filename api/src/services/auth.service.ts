import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../config/db.js';

export async function signup(name: string, email: string, password: string) {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) throw new Error('Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'employee')
     RETURNING id, name, email, role`,
        [name, email, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.role);
    return { user, token };
}

export async function login(email: string, password: string) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('Invalid credentials');

    const token = generateToken(user.id, user.role);
    return {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
    };
}

export async function logout(token: string) {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    const expiresAt = decoded?.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await pool.query(
        `INSERT INTO revoked_tokens (token_hash, expires_at)
     VALUES ($1, $2)
     ON CONFLICT (token_hash) DO NOTHING`,
        [tokenHash, expiresAt]
    );
}

function generateToken(userId: string, role: string) {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}
