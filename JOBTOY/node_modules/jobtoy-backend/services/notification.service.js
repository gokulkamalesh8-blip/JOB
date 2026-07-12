const Notification = require('../models/Notification.model');
const { getRedisClient } = require('../config/redis');
const logger = require('../config/logger');

const notificationTemplates = {
  application_received: {
    title: 'New Application Received',
    description: 'You have received a new application for {jobTitle}',
  },
  application_shortlisted: {
    title: 'Shortlisted!',
    description: 'Congratulations! You have been shortlisted for {jobTitle}',
  },
  application_rejected: {
    title: 'Application Update',
    description: 'Your application for {jobTitle} has been reviewed',
  },
  interview_scheduled: {
    title: 'Interview Scheduled',
    description: 'Interview scheduled for {jobTitle} on {interviewDate}',
  },
  message_received: {
    title: 'New Message',
    description: '{senderName} sent you a message',
  },
  job_matched: {
    title: 'Job Matched',
    description: '{jobTitle} matches your profile',
  },
};

class NotificationService {
  static async createNotification(userId, type, metadata = {}) {
    try {
      const template = notificationTemplates[type];

      const notification = new Notification({
        userId,
        type,
        title: template.title,
        description: template.description,
        metadata,
        link: metadata.link || null,
      });

      await notification.save();

      // Publish to Redis for real-time
      const redis = getRedisClient();
      if (redis) {
        redis.publish(
          `notifications:${userId}`,
          JSON.stringify({
            type: 'notification_created',
            notification: notification.toObject(),
          })
        );
      }

      logger.info(`Notification created: ${notification._id}`);
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  static async notifyApplicationReceived(jobId, applicationId, companyId) {
    return this.createNotification(companyId, 'application_received', {
      jobId,
      applicationId,
      link: `/applications/${applicationId}`,
    });
  }

  static async notifyApplicationShortlisted(applicationId, candidateId) {
    return this.createNotification(candidateId, 'application_shortlisted', {
      applicationId,
      link: `/applications/${applicationId}`,
    });
  }

  static async notifyMessageReceived(recipientId, senderId, messageId) {
    return this.createNotification(recipientId, 'message_received', {
      userId: senderId,
      link: `/messages`,
    });
  }

  static async notifyJobMatched(userId, jobId) {
    return this.createNotification(userId, 'job_matched', {
      jobId,
      link: `/jobs/${jobId}`,
    });
  }

  static async bulkNotify(userIds, type, metadata) {
    const notifications = userIds.map((userId) => ({
      userId,
      type,
      ...metadata,
    }));

    return Notification.insertMany(notifications);
  }
}

module.exports = NotificationService;