import { getPool } from '../config/database.js';

// Handles GET /profile. Returns the authenticated user's public profile data.
export const getProfile = async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT id, email, created_at FROM users WHERE id = ?', [req.user.userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
};
