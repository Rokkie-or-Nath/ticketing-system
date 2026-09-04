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

    const conditions: string[] = ['deleted_at IS NULL'];
    const values: any[] = [];
    let i = 1;

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

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

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

export async function getTicketById(ticketId: string, user: { userId: string; role: string }) {
    const ticketResult = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    const ticket = ticketResult.rows[0];
    if (!ticket || ticket.deleted_at) throw new Error('Ticket not found');

    if (user.role === 'employee' && ticket.created_by !== user.userId) {
        throw new Error('Not authorized to view this ticket');
    }

    const comments = await pool.query(
        `SELECT * FROM ticket_comments
     WHERE ticket_id = $1 ${user.role === 'employee' ? 'AND is_internal = false' : ''}
     ORDER BY created_at ASC`,
        [ticketId]
    );

    const attachments = await pool.query(
        'SELECT * FROM ticket_attachments WHERE ticket_id = $1 ORDER BY created_at ASC',
        [ticketId]
    );

    const activity = await pool.query(
        'SELECT * FROM ticket_activity_log WHERE ticket_id = $1 ORDER BY created_at ASC',
        [ticketId]
    );

    return { ticket, comments: comments.rows, attachments: attachments.rows, activity: activity.rows };
}

export async function getTicketActivity(ticketId: string, user: { userId: string; role: string }) {
    const ticketResult = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    const ticket = ticketResult.rows[0];
    if (!ticket || ticket.deleted_at) throw new Error('Ticket not found');

    if (user.role === 'employee' && ticket.created_by !== user.userId) {
        throw new Error('Not authorized to view this ticket');
    }

    const activity = await pool.query(
        'SELECT * FROM ticket_activity_log WHERE ticket_id = $1 ORDER BY created_at ASC',
        [ticketId]
    );

    return activity.rows;
}

export async function updateTicket(
    ticketId: string,
    actorId: string,
    updates: { status?: string; priority?: string; category?: string }
) {
    const current = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    const ticket = current.rows[0];
    if (!ticket || ticket.deleted_at) throw new Error('Ticket not found');

    const setClauses: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (updates.status) {
        setClauses.push(`status = $${i++}`);
        values.push(updates.status);
    }
    if (updates.priority) {
        setClauses.push(`priority = $${i++}`);
        values.push(updates.priority);
    }
    if (updates.category) {
        setClauses.push(`category = $${i++}`);
        values.push(updates.category);
    }
    setClauses.push(`updated_at = now()`);
    if (updates.status === 'resolved') {
        setClauses.push(`resolved_at = now()`);
    }

    values.push(ticketId);

    const result = await pool.query(
        `UPDATE tickets SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
        values
    );

    if (updates.status && updates.status !== ticket.status) {
        await pool.query(
            `INSERT INTO ticket_activity_log (ticket_id, actor_id, action_type, old_value, new_value)
       VALUES ($1, $2, 'status_changed', $3, $4)`,
            [ticketId, actorId, ticket.status, updates.status]
        );
    }
    if (updates.priority && updates.priority !== ticket.priority) {
        await pool.query(
            `INSERT INTO ticket_activity_log (ticket_id, actor_id, action_type, old_value, new_value)
       VALUES ($1, $2, 'priority_changed', $3, $4)`,
            [ticketId, actorId, ticket.priority, updates.priority]
        );
    }
    if (updates.category && updates.category !== ticket.category) {
        await pool.query(
            `INSERT INTO ticket_activity_log (ticket_id, actor_id, action_type, old_value, new_value)
       VALUES ($1, $2, 'category_changed', $3, $4)`,
            [ticketId, actorId, ticket.category, updates.category]
        );
    }

    return result.rows[0];
}

export async function assignTicket(ticketId: string, actorId: string, assigneeId: string) {
    const current = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    const ticket = current.rows[0];
    if (!ticket || ticket.deleted_at) throw new Error('Ticket not found');

    const result = await pool.query(
        `UPDATE tickets SET assigned_to = $1, updated_at = now() WHERE id = $2 RETURNING *`,
        [assigneeId, ticketId]
    );

    await pool.query(
        `INSERT INTO ticket_activity_log (ticket_id, actor_id, action_type, old_value, new_value)
     VALUES ($1, $2, $3, $4, $5)`,
        [
            ticketId,
            actorId,
            ticket.assigned_to ? 'reassigned' : 'assigned',
            ticket.assigned_to || null,
            assigneeId,
        ]
    );

    return result.rows[0];
}

export async function deleteTicket(ticketId: string, actorId: string) {
    const current = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    const ticket = current.rows[0];
    if (!ticket || ticket.deleted_at) throw new Error('Ticket not found');

    await pool.query('UPDATE tickets SET deleted_at = now() WHERE id = $1', [ticketId]);

    await pool.query(
        `INSERT INTO ticket_activity_log (ticket_id, actor_id, action_type, old_value, new_value)
     VALUES ($1, $2, 'ticket_deleted', NULL, NULL)`,
        [ticketId, actorId]
    );
}
