import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => res.send('OK'));

app.listen(process.env.PORT || 3001, () => console.log(`API running on port ${process.env.PORT || 3001}`));
