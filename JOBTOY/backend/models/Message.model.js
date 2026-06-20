const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    subject: String,
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        filename: String,
        url: String,
        type: String,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    conversationId: {
      type: String, // userId1-userId2 format
      required: true,
      index: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes
messageSchema.index({ senderId: 1, conversationId: 1 });
messageSchema.index({ recipientId: 1, conversationId: 1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ isRead: 1, recipientId: 1 });

module.exports = mongoose.model('Message', messageSchema);