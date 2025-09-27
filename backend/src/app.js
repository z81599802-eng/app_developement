import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// Enable CORS to allow the Vite frontend to communicate with this API.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
  })
);

// Parse incoming JSON request bodies.
app.use(express.json());

// Mount the authentication routes under the API root.
app.use('/', authRoutes);

// Centralized error handler that returns structured responses.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
});

export default app;
