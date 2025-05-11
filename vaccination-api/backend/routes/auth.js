const express = require('express');
const router = express.Router();

// Mock admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    return res.json({ token: 'mock-token-admin', user: { role: 'admin' } });
  }

  res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;