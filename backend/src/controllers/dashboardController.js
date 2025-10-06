const sectionMessages = {
  dashboard: 'Welcome to Dashboard',
  performance: 'Welcome to Performance',
  revenue: 'Welcome to Revenue'
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
  const section = req.params.section?.toLowerCase();

  if (!section || !sectionMessages[section]) {
    return res.status(404).json({ message: 'Requested dashboard section was not found.' });
  }

  return res.status(200).json({
    section,
    message: sectionMessages[section]
  });
};
