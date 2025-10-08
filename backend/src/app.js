import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import { authenticate } from './middleware/authMiddleware.js';
import {
  getDashboardOverview,
  getPerformanceOverview,
  getRevenueOverview
} from './controllers/dashboardController.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use(express.static(frontendDistPath));

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'PWA Auth API' });
});

app.use('/admin', adminRoutes);
app.use('/api', authRoutes);
app.use('/api', apiRoutes);

app.get('/api/dashboard', authenticate, getDashboardOverview);
app.get('/api/performance', authenticate, getPerformanceOverview);
app.get('/api/revenue', authenticate, getRevenueOverview);

app.use('/api/dashboard', dashboardRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

export default app;
