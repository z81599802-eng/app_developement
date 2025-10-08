import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const ADMIN_LINK_PAGES = ['dashboard', 'performance', 'revenue'];

const sanitizeUrl = (url) => {
  if (typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return '';
  }

  return trimmed;
};

const createAdminToken = ({ id, email, adminName }) =>
  jwt.sign(
    {
      sub: id,
      id,
      email,
      adminName,
      role: 'admin'
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

export const signupAdmin = async (req, res) => {
  const { adminName, email, password, confirmPassword, adminCreationToken } = req.body;
  const normalizedName = adminName?.trim();
  const normalizedEmail = email?.trim().toLowerCase();

  if (!adminCreationToken || adminCreationToken !== process.env.ADMIN_CREATION_TOKEN) {
    return res.status(403).json({ message: 'Invalid admin creation token.' });
  }

  if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    const [existing] = await pool.execute('SELECT id FROM admin WHERE email = ? LIMIT 1', [normalizedEmail]);

    if (existing.length > 0) {
      return res.status(409).json({ message: 'An admin with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO admin (admin_name, email, password_hash, created_at) VALUES (?, ?, ?, NOW())',
      [normalizedName, normalizedEmail, passwordHash]
    );

    const token = createAdminToken({ id: result.insertId, email: normalizedEmail, adminName: normalizedName });

    return res.status(201).json({
      message: 'Admin account created successfully.',
      token,
      admin: {
        id: result.insertId,
        adminName: normalizedName,
        email: normalizedEmail
      }
    });
  } catch (error) {
    console.error('Admin signup error:', error);
    return res.status(500).json({ message: 'Unable to create admin account at this time.' });
  }
};

export const loginAdmin = async (req, res) => {
  const { adminName, email, password } = req.body;
  const normalizedName = adminName?.trim();
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedName || !normalizedEmail || !password) {
    return res.status(400).json({ message: 'Admin name, email, and password are required.' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, admin_name AS adminName, email, password_hash FROM admin WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const admin = rows[0];

    if (admin.adminName.toLowerCase() !== normalizedName.toLowerCase()) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, admin.password_hash);

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = createAdminToken({ id: admin.id, email: admin.email, adminName: admin.adminName });

    return res.status(200).json({
      message: 'Admin login successful.',
      token,
      admin: {
        id: admin.id,
        adminName: admin.adminName,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: 'Unable to sign in at this time.' });
  }
};

export const createUserAccount = async (req, res) => {
  const { email, mobileNumber, password } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedMobile = mobileNumber?.trim() || null;

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'Email and password are required to create a user.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);

    if (existing.length > 0) {
      return res.status(409).json({ message: 'A user with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.execute(
      'INSERT INTO users (email, mobile_number, password_hash, created_at) VALUES (?, ?, ?, NOW())',
      [normalizedEmail, normalizedMobile, passwordHash]
    );

    return res.status(201).json({ message: 'User account created successfully.', email: normalizedEmail });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ message: 'Unable to create user account at this time.' });
  }
};

export const searchUsers = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  try {
    const wildcard = `%${query.trim()}%`;
    const [users] = await pool.execute(
      `SELECT id, email, mobile_number AS mobileNumber, created_at AS createdAt
       FROM users
       WHERE email LIKE ? OR mobile_number LIKE ?
       ORDER BY created_at DESC
       LIMIT 20`,
      [wildcard, wildcard]
    );

    const results = await Promise.all(
      users.map(async (user) => {
        const [links] = await pool.execute(
          'SELECT page, link FROM dashboardlinks WHERE email = ? ORDER BY created_at DESC',
          [user.email]
        );

        return {
          ...user,
          links
        };
      })
    );

    return res.status(200).json({ users: results });
  } catch (error) {
    console.error('User search error:', error);
    return res.status(500).json({ message: 'Unable to search users at this time.' });
  }
};

export const addDashboardLink = async (req, res) => {
  const { email, page, link } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !page || !link) {
    return res.status(400).json({ message: 'Email, page, and link are required.' });
  }

  const normalizedPage = page.toLowerCase();

  if (!ADMIN_LINK_PAGES.includes(normalizedPage)) {
    return res.status(400).json({ message: 'Invalid page specified.' });
  }

  const sanitizedLink = sanitizeUrl(link);

  if (!sanitizedLink) {
    return res.status(400).json({ message: 'Link must be a valid URL starting with http or https.' });
  }

  try {
    const [users] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found for the provided email.' });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM dashboardlinks WHERE email = ? AND page = ? LIMIT 1',
      [normalizedEmail, normalizedPage]
    );

    if (existing.length > 0) {
      await pool.execute('UPDATE dashboardlinks SET link = ?, created_at = NOW() WHERE id = ?', [
        sanitizedLink,
        existing[0].id
      ]);
    } else {
      await pool.execute(
        'INSERT INTO dashboardlinks (email, page, link, created_at) VALUES (?, ?, ?, NOW())',
        [normalizedEmail, normalizedPage, sanitizedLink]
      );
    }

    return res.status(200).json({ message: 'Dashboard link saved successfully.' });
  } catch (error) {
    console.error('Add dashboard link error:', error);
    return res.status(500).json({ message: 'Unable to save dashboard link at this time.' });
  }
};
