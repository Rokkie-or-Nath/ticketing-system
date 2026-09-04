import { pool } from '../config/db.js';

export async function addComment(
    ticketId: string,
    userId: string,
    message: string,
    isInternal: boolean
) {
    const ticketCheck = await pool.query('SELECT id FROM tickets WHERE id = $1', [ticketId]);
    if (ticketCheck.rows.length === 0) throw new Error('Ticket not found');

    const result = await pool.query(
        `INSERT INTO ticket_comments (ticket_id, user_id, message, is_internal)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
        [ticketId, userId, message, isInternal]
    );

    await pool.query(
        `INSERT INTO ticket_activity_log (ticket_id, actor_id, action_type, old_value, new_value)
     VALUES ($1, $2, 'comment_added', NULL, NULL)`,
        [ticketId, userId]
    );

    return result.rows[0];
}

export async function listComments(ticketId: string, role: string) {
    const result = await pool.query(
        `SELECT * FROM ticket_comments
     WHERE ticket_id = $1 ${role === 'employee' ? 'AND is_internal = false' : ''}
     ORDER BY created_at ASC`,
        [ticketId]
    );
    return result.rows;
}
