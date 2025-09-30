import { getPool } from '../config/database.js';

const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

// Ensures that the expected users table exists before the API starts handling requests.
export const ensureUsersTable = async () => {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.query(CREATE_USERS_TABLE);
    console.log('Users table is ready');
  } finally {
    connection.release();
  }
};
