import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

// Configure and return the Express app instance.
export const createApp = () => {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: false }));
  app.use(express.json());

  app.use('/api', authRoutes);
  app.use('/api', profileRoutes);

  // Global error handler to avoid leaking implementation details.
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
  });

  return app;
};
