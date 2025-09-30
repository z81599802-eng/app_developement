import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'PWA Auth API' });
});

app.use('/', authRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

export default app;
