import mysql from 'mysql2/promise';

// Create a lazily-initialised connection pool that uses environment variables for configuration.
// The pool is shared between requests to avoid creating new connections for each query.
let pool;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  return pool;
};
