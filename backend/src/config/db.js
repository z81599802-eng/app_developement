import 'dotenv/config';
import mysql from 'mysql2/promise';

const createPool = () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  return pool;
};

export const pool = createPool();

export const testConnection = async () => {
  try {
    await pool.getConnection();
    console.log('✅ Connected to MySQL database');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};
