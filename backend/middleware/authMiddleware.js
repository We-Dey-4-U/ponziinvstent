const jwt = require('jsonwebtoken');

exports.authenticateUser = (req, res, next) => {
  // Extract token from request headers or cookies
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Add user object to the request for future use
    next(); // Move to the next middleware or route handler
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid token' });
  }
};