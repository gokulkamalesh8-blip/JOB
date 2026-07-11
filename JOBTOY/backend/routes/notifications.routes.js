const express = require('express');
const { query } = require('express-validator');
const handleValidation = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth.middleware');
const Notification = require('../models/Notification.model');
const logger = require('../config/logger');
const { getRedisClient } = require('../config/redis');

const router = express.Router();

// GET /api/notifications
router.get(
  '/',
  authMiddleware,
  [
    query('page').optional().isInt().toInt().default(1),
    query('limit').optional().isInt().toInt().default(20),
    query('unread').optional().isBoolean(),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { page, limit, unread } = req.query;
      const userId = req.user._id;

      let filter = { userId };
      if (unread === 'true') {
        filter.isRead = false;
      }

      const skip = (page - 1) * limit;

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments(filter);

      const unreadCount = await Notification.countDocuments({
        userId,
        isRead: false,
      });

      res.json({
        success: true,
        notifications,
        unreadCount,
        total,
        page,
        limit,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/notifications/:id/read
router.put('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authMiddleware, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;