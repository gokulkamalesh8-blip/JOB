const express = require('express');
const { body, param, query } = require('express-validator');
const handleValidation = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth');
const Message = require('../models/Message.model');
const User = require('../models/User.model');
const logger = require('../config/logger');
const { getRedisClient } = require('../config/redis');

const router = express.Router();

// Utility: Generate conversation ID
const getConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('-');
};

// GET /api/messages/conversations
router.get('/conversations', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { recipientId: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$content' },
          lastMessageDate: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipientId', userId] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { lastMessageDate: -1 },
      },
      {
        $limit: 50,
      },
    ]);

    // Fetch user details for each conversation
    const conversationsWithUsers = await Promise.all(
      conversations.map(async (conv) => {
        const [user1Id, user2Id] = conv._id.split('-');
        const otherUserId = user1Id === userId.toString() ? user2Id : user1Id;
        const otherUser = await User.findById(otherUserId).select(
          'name avatar headline'
        );

        return {
          conversationId: conv._id,
          participant: otherUser,
          lastMessage: conv.lastMessage,
          lastMessageDate: conv.lastMessageDate,
          unreadCount: conv.unreadCount,
        };
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithUsers,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/messages/:userId
router.get('/:userId', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    const { page = 1, limit = 50 } = req.query;

    const conversationId = getConversationId(currentUserId, userId);

    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name avatar headline')
      .populate('recipientId', 'name avatar headline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ conversationId });

    // Mark messages as read
    await Message.updateMany(
      { conversationId, recipientId: currentUserId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      messages: messages.reverse(),
      total,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/messages/send
router.post(
  '/send',
  authMiddleware,
  [
    body('recipientId').notEmpty().withMessage('Recipient is required'),
    body('content').trim().notEmpty().withMessage('Message content is required'),
  ],
  handleValidation,
  async (req, res, next) => {
    try {
      const { recipientId, content, jobId, applicationId, subject } = req.body;
      const senderId = req.user._id;

      // Verify recipient exists
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({
          success: false,
          message: 'Recipient not found',
        });
      }

      const conversationId = getConversationId(senderId, recipientId);

      const message = new Message({
        senderId,
        recipientId,
        content,
        jobId,
        applicationId,
        subject,
        conversationId,
      });

      await message.save();
      await message.populate('senderId', 'name avatar headline');

      // Publish to Redis for real-time notifications
      const redis = getRedisClient();
      if (redis) {
        redis.publish(
          `messages:${recipientId}`,
          JSON.stringify({
            type: 'new_message',
            message: message.toObject(),
            from: {
              id: senderId,
              name: req.user.name,
            },
          })
        );
      }

      logger.info(`Message sent: ${message._id}`);

      res.status(201).json({
        success: true,
        message: 'Message sent',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/messages/:messageId
router.put(
  '/:messageId',
  authMiddleware,
  [body('content').trim().notEmpty().withMessage('Content is required')],
  handleValidation,
  async (req, res, next) => {
    try {
      const { messageId } = req.params;
      const { content } = req.body;

      const message = await Message.findById(messageId);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found',
        });
      }

      if (message.senderId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      message.content = content;
      await message.save();

      res.json({
        success: true,
        message: 'Message updated',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/messages/:messageId
router.delete('/:messageId', authMiddleware, async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/messages/unread/count
router.get('/unread/count', authMiddleware, async (req, res, next) => {
  try {
    const unreadCount = await Message.countDocuments({
      recipientId: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;