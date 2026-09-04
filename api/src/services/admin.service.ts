import { pool } from '../config/db.js';

export async function getOverviewStats() {
    const totalResult = await pool.query('SELECT COUNT(*) FROM tickets');
    const byStatusResult = await pool.query(
        'SELECT status, COUNT(*) FROM tickets GROUP BY status'
    );

    return {
        total: parseInt(totalResult.rows[0].count, 10),
        byStatus: byStatusResult.rows.reduce((acc, row) => {
            acc[row.status] = parseInt(row.count, 10);
            return acc;
        }, {} as Record<string, number>),
    };
}

export async function getSlaBreachStats() {
    // Pull all open/in_progress tickets with their SLA rule, compute breach in SQL
    const result = await pool.query(`
    SELECT t.id, t.priority, t.status, t.created_at, s.resolution_time_minutes
    FROM tickets t
    JOIN sla_rules s ON s.priority = t.priority
    WHERE t.status IN ('open', 'in_progress')
  `);

    let breached = 0;
    let onTrack = 0;

    for (const row of result.rows) {
        const elapsedMinutes = (Date.now() - new Date(row.created_at).getTime()) / 1000 / 60;
        if (elapsedMinutes > row.resolution_time_minutes) {
            breached++;
        } else {
            onTrack++;
        }
    }

    const totalOpen = breached + onTrack;

    return {
        totalOpenTickets: totalOpen,
        breached,
        onTrack,
        breachRate: totalOpen > 0 ? Math.round((breached / totalOpen) * 100) : 0,
    };
}

export async function getAgentStats() {
    const result = await pool.query(`
    SELECT
      u.id,
      u.name,
      COUNT(t.id) FILTER (WHERE t.status IN ('resolved', 'closed')) AS resolved_count,
      COUNT(t.id) AS total_assigned,
      AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 60)
        FILTER (WHERE t.resolved_at IS NOT NULL) AS avg_resolution_minutes
    FROM users u
    LEFT JOIN tickets t ON t.assigned_to = u.id
    WHERE u.role IN ('agent', 'admin')
    GROUP BY u.id, u.name
    ORDER BY resolved_count DESC
  `);

    return result.rows.map((row) => ({
        agentId: row.id,
        name: row.name,
        totalAssigned: parseInt(row.total_assigned, 10),
        resolvedCount: parseInt(row.resolved_count, 10),
        avgResolutionMinutes: row.avg_resolution_minutes ? Math.round(row.avg_resolution_minutes) : null,
    }));
}

export async function listUsers() {
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
}

export async function updateUserRole(userId: string, role: string) {
    const validRoles = ['employee', 'agent', 'admin'];
    if (!validRoles.includes(role)) throw new Error('Invalid role');

    const result = await pool.query(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
        [role, userId]
    );

    if (result.rows.length === 0) throw new Error('User not found');
    return result.rows[0];
}
