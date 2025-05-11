// authMiddleware.js (Role-based access control)

function authenticate(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Simulate token verification
  if (token === 'mock-token-admin') {
    req.user = { role: 'admin' }; // Hardcode the user role as 'admin'
    next(); // Proceed to the next middleware/route handler
  } else {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function authorizeAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next(); // Allow access if the user is an admin
  } else {
    return res.status(403).json({ error: 'Access denied' }); // Forbidden if not an admin
  }
}

module.exports = { authenticate, authorizeAdmin };
