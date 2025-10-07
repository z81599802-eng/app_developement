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
