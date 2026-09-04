import { pool } from '../config/db.js';

export async function addAttachment(
    ticketId: string,
    uploadedBy: string,
    file: { filename: string; originalname: string; size: number; mimetype: string }
) {
    const ticketCheck = await pool.query('SELECT id FROM tickets WHERE id = $1', [ticketId]);
    if (ticketCheck.rows.length === 0) throw new Error('Ticket not found');

    const fileUrl = `/uploads/${file.filename}`;

    const result = await pool.query(
        `INSERT INTO ticket_attachments (ticket_id, uploaded_by, file_name, file_url, file_size, file_type)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
        [ticketId, uploadedBy, file.originalname, fileUrl, file.size, file.mimetype]
    );

    return result.rows[0];
}

export async function listAttachments(ticketId: string) {
    const result = await pool.query(
        'SELECT * FROM ticket_attachments WHERE ticket_id = $1 ORDER BY created_at ASC',
        [ticketId]
    );
    return result.rows;
}

export async function deleteAttachment(attachmentId: string, userId: string, role: string) {
    const result = await pool.query('SELECT * FROM ticket_attachments WHERE id = $1', [attachmentId]);
    const attachment = result.rows[0];
    if (!attachment) throw new Error('Attachment not found');

    if (attachment.uploaded_by !== userId && role !== 'admin') {
        throw new Error('Not authorized to delete this attachment');
    }

    await pool.query('DELETE FROM ticket_attachments WHERE id = $1', [attachmentId]);
}
