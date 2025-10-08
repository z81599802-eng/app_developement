import jwt from 'jsonwebtoken';

const extractToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1];
};

export const verifyJWT = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Authorization header missing or invalid.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const ensureRole = (role) => (req, res, next) => {
  return verifyJWT(req, res, () => {
    if (!req.user?.role) {
      return res.status(403).json({ message: 'Access denied. User role missing.' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    return next();
  });
};

export const authenticate = ensureRole('user');

export const verifyAdmin = ensureRole('admin');
