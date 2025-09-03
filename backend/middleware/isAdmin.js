module.exports = (req, res, next) => {
  try {
    console.log('Entering isAdmin middleware', req.user);
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied, admin only' });
    }
    console.log("req.user.role", req.user.role);
    next();
  } catch (error) {
    console.error('isAdmin error:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};