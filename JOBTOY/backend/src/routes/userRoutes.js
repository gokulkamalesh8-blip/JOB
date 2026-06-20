const express = require('express');
const router = express.Router();

// Get all users
router.get('/', (req, res) => {
  res.json({ 
    message: 'Get all users',
    users: []
  });
});

// Register user
router.post('/register', (req, res) => {
  res.json({ 
    message: 'User registered',
    data: req.body
  });
});

// Login user
router.post('/login', (req, res) => {
  res.json({ 
    message: 'User logged in',
    token: 'jwt_token_here'
  });
});

module.exports = router;