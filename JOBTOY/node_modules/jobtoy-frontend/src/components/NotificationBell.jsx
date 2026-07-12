import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Badge } from './index';
import './NotificationBell.css';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    const icons = {
      application_received: '📋',
      application_shortlisted: '⭐',
      application_rejected: '❌',
      interview_scheduled: '📅',
      message_received: '💬',
      job_matched: '🎯',
    };
    return icons[type] || '🔔';
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && <Badge variant="danger">{unreadCount}</Badge>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-btn">
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="empty-notification">No notifications</p>
            ) : (
              notifications.slice(0, 10).map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-item ${
                    notif.isRead ? 'read' : 'unread'
                  }`}
                  onClick={() => !notif.isRead && markAsRead(notif._id)}
                >
                  <span className="notification-icon">
                    {getNotificationIcon(notif.type)}
                  </span>
                  <div className="notification-content">
                    <p className="notification-title">{notif.title}</p>
                    <p className="notification-desc">
                      {notif.description}
                    </p>
                    <span className="notification-time">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!notif.isRead && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <a href="/notifications" className="view-all-link">
              View all notifications →
            </a>
          )}
        </div>
      )}
    </div>
  );
}