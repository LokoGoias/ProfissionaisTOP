const jwt = require('jsonwebtoken');

module.exports = {
  requireAuth: (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'No token provided' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  },

  requireAdmin: (req, res, next) => {
    if (req.user?.isAdmin !== true) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  },

  optional: (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      }
    } catch (error) {
      // Token invalid but optional
    }
    next();
  }
};
