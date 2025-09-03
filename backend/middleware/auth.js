const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
     console.log("decoded",decoded)
    req.user = decoded;
     console.log("req.user",req.user) // Includes id, email, role
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};