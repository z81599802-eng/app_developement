import { pool } from '../config/db.js';

const sectionMessages = {
  dashboard: 'Welcome to Dashboard',
  performance: 'Welcome to Performance',
  revenue: 'Welcome to Revenue'
};

const respondWithSection = (res, section) => {
  const normalizedSection = section?.toLowerCase();

  if (!normalizedSection || !sectionMessages[normalizedSection]) {
    return res.status(404).json({ message: 'Requested dashboard section was not found.' });
  }

  return res.status(200).json({
    section: normalizedSection,
    message: sectionMessages[normalizedSection]
  });
};

export const getDashboardStatus = (req, res) => {
  return res.status(200).json({
    message: 'Dashboard access verified.',
    user: {
      id: req.user.id,
      email: req.user.email || null
    }
  });
};

export const getDashboardSection = (req, res) => {
  return respondWithSection(res, req.params.section);
};

export const getDashboardOverview = (req, res) => respondWithSection(res, 'dashboard');

export const getPerformanceOverview = (req, res) => respondWithSection(res, 'performance');

export const getRevenueOverview = (req, res) => respondWithSection(res, 'revenue');

export const getDashboardLink = async (req, res) => {
  const { email, page } = req.query;

  if (!page) {
    return res.status(400).json({ message: 'Page query parameter is required.' });
  }

  const normalizedPage = page.toLowerCase();

  if (!sectionMessages[normalizedPage]) {
    return res.status(400).json({ message: 'Invalid page requested.' });
  }

  const authenticatedEmail = req.user?.email;

  if (!authenticatedEmail) {
    return res.status(403).json({ message: 'Authenticated user email not found.' });
  }

  if (email && email !== authenticatedEmail) {
    return res.status(403).json({ message: 'You are not allowed to access links for other users.' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT link FROM dashboardlinks WHERE email = ? AND page = ? LIMIT 1',
      [authenticatedEmail, normalizedPage]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No dashboard link configured for this section yet.' });
    }

    return res.status(200).json({
      email: authenticatedEmail,
      page: normalizedPage,
      link: rows[0].link
    });
  } catch (error) {
    console.error('Get dashboard link error:', error);
    return res.status(500).json({ message: 'Unable to retrieve dashboard link at this time.' });
  }
};
