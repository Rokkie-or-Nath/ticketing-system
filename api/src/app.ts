import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import ticketsRoutes from './routes/tickets.routes.ts';
import slaRoutes from './routes/sla.routes.ts';
import adminRoutes from './routes/admin.routes.ts';
import attachmentDeleteRoutes from './routes/attachmentDelete.routes.ts';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api', slaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attachments', attachmentDeleteRoutes);

app.get('/health', (req, res) => res.send('OK'));

export default app;

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
    const port = process.env.PORT || 3001;
    app.listen(port, () => console.log(`API running on port ${port}`));
}
