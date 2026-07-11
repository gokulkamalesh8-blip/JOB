const express = require('express');
const { body } = require('express-validator');
const handleValidation = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth.middleware');
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const router = express.Router();

// Utility to generate token
const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id, userType: user.userType },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('userType')
      .isIn(['job_seeker', 'employer'])
      .withMessage('Invalid user type'),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { name, email, password, userType } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists',
          code: 'USER_EXISTS',
        });
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        userType,
      });

      await user.save();

      const token = generateToken(user);

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: user.toJSON(),
        data: { user: user.toJSON() },
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user);

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        message: 'Login successful',
        user: user.toJSON(),
        data: { user: user.toJSON() },
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/logout
router.post('/logout', authMiddleware, (req, res) => {
  logger.info(`User logged out: ${req.user._id}`);
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

module.exports = router;
