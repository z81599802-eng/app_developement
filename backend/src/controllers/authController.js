import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getPool } from '../config/database.js';

const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 hours

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set.');
  }
  return process.env.JWT_SECRET;
};

const createToken = (payload) =>
  jwt.sign(payload, getJwtSecret(), {
    expiresIn: TOKEN_TTL_SECONDS
  });

// Handles POST /signup. Creates a new account when the email is not already registered.
export const signup = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const pool = getPool();

    const [existingRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingRows.length > 0) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash]);

    return res.status(201).json({ message: 'Account created successfully.' });
  } catch (error) {
    return next(error);
  }
};

// Handles POST /login. Verifies credentials and returns a signed JWT when valid.
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT id, password_hash FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = createToken({ userId: user.id, email });
    return res.json({ token });
  } catch (error) {
    return next(error);
  }
};
