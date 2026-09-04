import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import ticketsRoutes from './routes/tickets.routes.ts';
import slaRoutes from './routes/sla.routes.ts';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api', slaRoutes);

app.get('/health', (req, res) => res.send('OK'));

app.listen(process.env.PORT || 3001, () => console.log(`API running on port ${process.env.PORT || 3001}`));
