import { pool } from '../config/db.js';

export async function createTicket(
    userId: string,
    data: { subject: string; description: string; category: string; priority: string }
) {
    const result = await pool.query(
        `INSERT INTO tickets (subject, description, category, priority, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
        [data.subject, data.description, data.category, data.priority, userId]
    );

    const ticket = result.rows[0];

    // Log ticket creation in the activity log
    await pool.query(
        `INSERT INTO ticket_activity_log (ticket_id, actor_id, action_type, old_value, new_value)
     VALUES ($1, $2, 'status_changed', NULL, 'open')`,
        [ticket.id, userId]
    );

    return ticket;
}

export async function listTickets(
    user: { userId: string; role: string },
    filters: { status?: string; priority?: string; category?: string; query?: string; page?: number; limit?: number }
) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    // Employees only see their own tickets; agents/admins see all
    if (user.role === 'employee') {
        conditions.push(`created_by = $${i++}`);
        values.push(user.userId);
    }

    if (filters.status) {
        conditions.push(`status = $${i++}`);
        values.push(filters.status);
    }
    if (filters.priority) {
        conditions.push(`priority = $${i++}`);
        values.push(filters.priority);
    }
    if (filters.category) {
        conditions.push(`category = $${i++}`);
        values.push(filters.category);
    }
    if (filters.query) {
        conditions.push(`(subject ILIKE $${i} OR description ILIKE $${i})`);
        values.push(`%${filters.query}%`);
        i++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const dataResult = await pool.query(
        `SELECT * FROM tickets ${whereClause} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
        [...values, limit, offset]
    );

    const countResult = await pool.query(
        `SELECT COUNT(*) FROM tickets ${whereClause}`,
        values
    );

    return {
        data: dataResult.rows,
        page,
        limit,
        total: parseInt(countResult.rows[0].count, 10),
    };
}
