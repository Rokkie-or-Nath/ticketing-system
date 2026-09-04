import { pool } from '../config/db.js';

export async function getSlaRules() {
    const result = await pool.query('SELECT * FROM sla_rules ORDER BY priority');
    return result.rows;
}

export async function updateSlaRule(
    priority: string,
    updates: { responseTimeMinutes?: number; resolutionTimeMinutes?: number }
) {
    const setClauses: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (updates.responseTimeMinutes !== undefined) {
        setClauses.push(`response_time_minutes = $${i++}`);
        values.push(updates.responseTimeMinutes);
    }
    if (updates.resolutionTimeMinutes !== undefined) {
        setClauses.push(`resolution_time_minutes = $${i++}`);
        values.push(updates.resolutionTimeMinutes);
    }

    values.push(priority);

    const result = await pool.query(
        `UPDATE sla_rules SET ${setClauses.join(', ')} WHERE priority = $${i} RETURNING *`,
        values
    );

    if (result.rows.length === 0) throw new Error('SLA rule not found for that priority');
    return result.rows[0];
}

export async function getTicketSlaStatus(ticketId: string, user: { userId: string; role: string }) {
    const ticketResult = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    const ticket = ticketResult.rows[0];
    if (!ticket || ticket.deleted_at) throw new Error('Ticket not found');

    if (user.role === 'employee' && ticket.created_by !== user.userId) {
        throw new Error('Not authorized to view this ticket');
    }

    const ruleResult = await pool.query('SELECT * FROM sla_rules WHERE priority = $1', [ticket.priority]);
    const rule = ruleResult.rows[0];
    if (!rule) throw new Error('No SLA rule configured for this priority');

    const createdAt = new Date(ticket.created_at).getTime();
    const now = Date.now();
    const elapsedMinutes = (now - createdAt) / 1000 / 60;

    const responseDeadline = rule.response_time_minutes;
    const resolutionDeadline = rule.resolution_time_minutes;

    const isResolved = ticket.status === 'resolved' || ticket.status === 'closed';

    return {
        priority: ticket.priority,
        status: ticket.status,
        responseTargetMinutes: responseDeadline,
        resolutionTargetMinutes: resolutionDeadline,
        elapsedMinutes: Math.round(elapsedMinutes),
        responseBreached: !isResolved && elapsedMinutes > responseDeadline,
        resolutionBreached: !isResolved && elapsedMinutes > resolutionDeadline,
        resolutionRemainingMinutes: isResolved ? null : Math.max(0, Math.round(resolutionDeadline - elapsedMinutes)),
    };
}
