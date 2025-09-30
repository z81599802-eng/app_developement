import dotenv from 'dotenv';
import { createApp } from './app.js';
import { ensureUsersTable } from './utils/bootstrap.js';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const startServer = async () => {
  try {
    await ensureUsersTable();
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
