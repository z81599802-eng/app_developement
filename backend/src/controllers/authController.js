import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { sendResetEmail } from '../utils/email.js';

const generateToken = (payload, expiresIn = '7d') =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

export const signup = async (req, res) => {
  const { email, mobileNumber, password, confirmPassword } = req.body;

  try {
    if (!email && !mobileNumber) {
      return res.status(400).json({ message: 'Email or mobile number is required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR mobile_number = ?',
      [email || null, mobileNumber || null]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with that email or mobile already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.execute(
      'INSERT INTO users (email, mobile_number, password_hash, created_at) VALUES (?, ?, ?, NOW())',
      [email || null, mobileNumber || null, passwordHash]
    );

    return res.status(201).json({ message: 'Account created successfully. Please sign in.' });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Failed to create account. Please try again later.' });
  }
};

export const login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identifier and password are required.' });
    }

    const [rows] = await pool.execute(
      'SELECT id, email, mobile_number, password_hash FROM users WHERE email = ? OR mobile_number = ? LIMIT 1',
      [identifier, identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken({ id: user.id, email: user.email });

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        mobileNumber: user.mobile_number
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Failed to sign in. Please try again later.' });
  }
};

export const profile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      'SELECT id, email, mobile_number, created_at FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user: rows[0] });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ message: 'Failed to retrieve profile.' });
  }
};

export const resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required to reset password.' });
    }

    const [rows] = await pool.execute('SELECT id, email FROM users WHERE email = ? LIMIT 1', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No account found with that email.' });
    }

    const user = rows[0];
    const resetToken = generateToken({ id: user.id }, '1h');
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await sendResetEmail({ to: email, link: resetLink });

    return res.status(200).json({ message: 'Password reset email sent successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Failed to send reset password email.' });
  }
};
