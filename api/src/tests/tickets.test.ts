import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Tickets API', () => {
    let employeeToken: string;
    let ticketId: string;

    beforeAll(async () => {
        const signup = await request(app).post('/api/auth/signup').send({
            name: 'Test User',
            email: `test-${Date.now()}@example.com`,
            password: 'password123',
        });
        employeeToken = signup.body.token;
    });

    it('creates a ticket', async () => {
        const res = await request(app)
            .post('/api/tickets')
            .set('Authorization', `Bearer ${employeeToken}`)
            .send({ subject: 'Test', description: 'Test issue', category: 'bug', priority: 'low' });

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        ticketId = res.body.id;
    });

    it('rejects unauthenticated ticket creation', async () => {
        const res = await request(app).post('/api/tickets').send({ subject: 'x' });
        expect(res.status).toBe(401);
    });

    it('does not let one employee see another employee\'s ticket', async () => {
        const otherSignup = await request(app).post('/api/auth/signup').send({
            name: 'Other User',
            email: `other-${Date.now()}@example.com`,
            password: 'password123',
        });
        const res = await request(app)
            .get(`/api/tickets/${ticketId}`)
            .set('Authorization', `Bearer ${otherSignup.body.token}`);
        expect(res.status).toBe(403);
    });

    // This one will currently FAIL — documents the sla-status access-control gap above
    it('should block employees from viewing other users\' sla-status (currently does not)', async () => {
        const otherSignup = await request(app).post('/api/auth/signup').send({
            name: 'Other User 2',
            email: `other2-${Date.now()}@example.com`,
            password: 'password123',
        });
        const res = await request(app)
            .get(`/api/tickets/${ticketId}/sla-status`)
            .set('Authorization', `Bearer ${otherSignup.body.token}`);
        expect(res.status).toBe(403); // will actually return 200 right now
    });
});
