import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/notifications?limit=50', config);
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        await axios.put(`/api/notifications/${notificationId}/read`, {}, config);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    [token]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await axios.put('/api/notifications/read-all', {}, config);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [token]);

  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        await axios.delete(`/api/notifications/${notificationId}`, config);
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token, fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};